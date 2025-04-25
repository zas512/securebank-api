import Transaction from "../models/transaction.model";
import Account from "../models/account.model";
import type { Request, Response } from "express";
import sendResponse from "../utils/responseHelper";
import type { FilterQuery, Types } from "mongoose";

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
