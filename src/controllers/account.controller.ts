import Account from "../models/account.model";
import Transaction from "../models/transaction.model";
import type { Request, Response } from "express";
import sendResponse from "../utils/responseHelper";
import { verifyPin } from "../utils/verifyPin";
import mongoose from "mongoose";

export const createAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, currency, limit, pin, name } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      sendResponse(res, 401, false, "Unauthorized");
      return;
    }
    if (!type || typeof type !== "string") {
      sendResponse(res, 400, false, "Account type is required and must be a string");
      return;
    }
    if (!pin || typeof pin !== "string") {
      sendResponse(res, 400, false, "PIN is required and must be a string");
      return;
    }
    const isPinValid = await verifyPin(userId, pin);
    if (!isPinValid) {
      sendResponse(res, 400, false, "Invalid PIN");
      return;
    }
    const number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const account = new Account({
      userId,
      type,
      number,
      name,
      balance: 0,
      currency: currency ?? "USD",
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
    const { fromAccountId, toAccountId, amount, description, pin } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      sendResponse(res, 401, false, "Unauthorized");
      return;
    }
    if (amount <= 0) {
      sendResponse(res, 400, false, "Transfer amount must be greater than zero");
      return;
    }
    const isPinValid = await verifyPin(userId, pin);
    if (!isPinValid) {
      sendResponse(res, 400, false, "Invalid PIN");
      return;
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const fromAccount = await Account.findOne({ _id: fromAccountId, userId }).session(session);
      if (!fromAccount) {
        throw new Error("Source account not found or unauthorized");
      }
      if (fromAccount.balance < amount) {
        throw new Error("Insufficient balance");
      }
      let toAccount = null;
      if (mongoose.Types.ObjectId.isValid(toAccountId)) {
        toAccount = await Account.findById(toAccountId).session(session);
      }
      fromAccount.balance -= amount;
      const debitTransaction = new Transaction({
        accountId: fromAccount._id,
        amount,
        balance: fromAccount.balance,
        description,
        category: "transfer",
        type: "debit",
        reference: toAccount ? toAccount.number : toAccountId,
        fromAccountId: fromAccount._id,
        ...(toAccount && { toAccountId: toAccount._id })
      });
      await fromAccount.save({ session });
      await debitTransaction.save({ session });
      let creditTransaction = null;
      if (toAccount) {
        toAccount.balance += amount;
        creditTransaction = new Transaction({
          accountId: toAccount._id,
          amount,
          balance: toAccount.balance,
          description,
          category: "transfer",
          type: "credit",
          reference: fromAccount.number,
          fromAccountId: fromAccount._id,
          toAccountId: toAccount._id
        });
        await toAccount.save({ session });
        await creditTransaction.save({ session });
      }
      await session.commitTransaction();
      sendResponse(res, 200, true, "Transfer successful", {
        fromAccount,
        ...(toAccount && { toAccount }),
        transactions: creditTransaction ? [debitTransaction, creditTransaction] : [debitTransaction]
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

export const getAccountDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId } = req.params;
    const userId = req.user?.id;
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      sendResponse(res, 404, false, "Account not found or unauthorized");
      return;
    }
    sendResponse(res, 200, true, "Account details retrieved", { account });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};

export const payBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId, amount, description, category, pin } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      sendResponse(res, 400, false, "User not authenticated");
      return;
    }
    if (amount <= 0) {
      sendResponse(res, 400, false, "Amount must be greater than zero");
      return;
    }
    if (!category || !description) {
      sendResponse(res, 400, false, "Category and description are required");
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
    if (account.balance < amount) {
      sendResponse(res, 400, false, "Insufficient balance");
      return;
    }
    account.balance -= amount;
    const billTransaction = new Transaction({
      accountId: account._id,
      amount,
      balance: account.balance,
      description,
      category,
      type: "debit"
    });
    await account.save();
    await billTransaction.save();
    sendResponse(res, 200, true, "Bill payment successful", {
      account,
      transaction: billTransaction
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      sendResponse(res, 401, false, "Unauthorized");
      return;
    }
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      sendResponse(res, 404, false, "Account not found or unauthorized");
      return;
    }
    if (account.balance > 0) {
      sendResponse(res, 400, false, "Account cannot be deleted. Balance must be zero.");
      return;
    }
    await Account.deleteOne({ _id: accountId });
    sendResponse(res, 200, true, "Account deleted successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};
