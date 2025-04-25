import Account from "../models/account.model";
import Transaction from "../models/transaction.model";
import type { Request, Response } from "express";
import sendResponse from "../utils/responseHelper";

export const createAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, currency, limit } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      sendResponse(res, 401, false, "Unauthorized");
      return;
    }

    // Generate a random account number
    const number = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const account = new Account({
      userId,
      type,
      number,
      currency,
      limit
    });

    await account.save();
    sendResponse(res, 201, true, "Account created successfully", { account });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};

export const getAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const accounts = await Account.find({ userId });
    sendResponse(res, 200, true, "Accounts retrieved successfully", { accounts });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};

export const transferMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      sendResponse(res, 401, false, "Unauthorized");
      return;
    }

    // Start a session for transaction
    const session = await Account.startSession();
    session.startTransaction();

    try {
      // Get and validate source account
      const fromAccount = await Account.findOne({ _id: fromAccountId, userId });
      if (!fromAccount) {
        throw new Error("Source account not found or unauthorized");
      }

      // Get destination account
      const toAccount = await Account.findById(toAccountId);
      if (!toAccount) {
        throw new Error("Destination account not found");
      }

      // Check if source account has sufficient balance
      if (fromAccount.balance < amount) {
        throw new Error("Insufficient balance");
      }

      // Update balances
      fromAccount.balance -= amount;
      toAccount.balance += amount;

      // Create transaction records
      const debitTransaction = new Transaction({
        accountId: fromAccount._id,
        amount,
        balance: fromAccount.balance,
        description,
        category: "transfer",
        type: "debit",
        reference: toAccount.number
      });

      const creditTransaction = new Transaction({
        accountId: toAccount._id,
        amount,
        balance: toAccount.balance,
        description,
        category: "transfer",
        type: "credit",
        reference: fromAccount.number
      });

      // Save all changes
      await fromAccount.save({ session });
      await toAccount.save({ session });
      await debitTransaction.save({ session });
      await creditTransaction.save({ session });

      await session.commitTransaction();
      sendResponse(res, 200, true, "Transfer successful", {
        fromAccount,
        toAccount,
        transactions: [debitTransaction, creditTransaction]
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};
