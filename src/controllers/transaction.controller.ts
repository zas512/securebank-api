import Transaction from "../models/transaction.model";
import Account from "../models/account.model";
import type { Request, Response } from "express";
import sendResponse from "../utils/responseHelper";
import { Types } from "mongoose";
import { verifyPin } from "../utils/verifyPin";

interface TransactionQuery {
  accountId?: string | Types.ObjectId | { $in: Types.ObjectId[] };
  date?: {
    $gte?: Date;
    $lte?: Date;
  };
  type?: string;
  category?: string;
}

export const getTransactionDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;
    const userId = req.user?.id;

    // Get user's accounts
    const userAccounts = await Account.find({ userId });
    const accountIds = userAccounts.map((account) => account._id);

    const transaction = await Transaction.findOne({
      _id: transactionId,
      accountId: { $in: accountIds }
    }).populate("accountId", "number type");

    if (!transaction) {
      sendResponse(res, 404, false, "Transaction not found");
      return;
    }

    sendResponse(res, 200, true, "Transaction details retrieved successfully", { transaction });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};


export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    const userAccounts = await Account.find({ userId });
    const accountIds = userAccounts.map((account) => account._id);

    const transactions = await Transaction.find({ accountId: { $in: accountIds } })
      .sort({ date: -1 })
      .populate("accountId", "number type");

    sendResponse(res, 200, true, "Transactions retrieved", {
      transactions
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};


export const handleTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId, amount, description, type, pin } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      sendResponse(res, 401, false, "Unauthorized");
      return;
    }

    if (!["deposit", "withdraw"].includes(type)) {
      sendResponse(res, 400, false, "Invalid transaction type");
      return;
    }

    if (amount <= 0) {
      sendResponse(res, 400, false, "Amount must be greater than zero");
      return;
    }

    const isPinValid = await verifyPin(userId, pin);
    if (!isPinValid) {
      sendResponse(res, 400, false, "Invalid PIN");
      return;
    }

    const account = await Account.findOne({ _id: accountId, userId });

    if (!account) {
      sendResponse(res, 404, false, "Account not found or unauthorized");
      return;
    }

    if (type === "withdraw") {
      if (account.balance < amount) {
        sendResponse(res, 400, false, "Insufficient balance for withdrawal");
        return;
      }
      account.balance -= amount;
    } else {
      account.balance += amount;
    }

    await account.save();

    const transaction = new Transaction({
      accountId: account._id,
      amount,
      balance: account.balance,
      description: description ?? (type === "deposit" ? "Deposit" : "Withdrawal"),
      category: type,
      type: type === "deposit" ? "credit" : "debit",
      date: new Date(),
    });

    await transaction.save();

    sendResponse(res, 200, true, `${type === "deposit" ? "Deposit" : "Withdrawal"} successful`, {
      account,
      transaction,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};