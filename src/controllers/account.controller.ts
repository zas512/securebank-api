import Account from "../models/account.model";
import Transaction from "../models/transaction.model";
import type { Request, Response } from "express";
import sendResponse from "../utils/responseHelper";
import { verifyPin } from "../utils/verifyPin";

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

    // Verify PIN
    const isPinValid = await verifyPin(userId, pin);
    if (!isPinValid) {
      sendResponse(res, 400, false, "Invalid PIN");
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

    // Validate input
    if (amount <= 0) {
      sendResponse(res, 400, false, "Amount must be greater than zero");
      return;
    }
    if (!category || !description) {
      sendResponse(res, 400, false, "Category and description are required");
      return;
    }

    // Verify PIN
    const isPinValid = await verifyPin(userId, pin);
    if (!isPinValid) {
      sendResponse(res, 400, false, "Invalid PIN");
      return;
    }

    // Find user account
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      sendResponse(res, 404, false, "Account not found or unauthorized");
      return;
    }

    // Check if the account has sufficient balance
    if (account.balance < amount) {
      sendResponse(res, 400, false, "Insufficient balance");
      return;
    }

    // Deduct the amount from the account balance
    account.balance -= amount;

    // Create a new transaction for the bill payment
    const billTransaction = new Transaction({
      accountId: account._id,
      amount,
      balance: account.balance,
      description,
      category,
      type: "debit" // It's a debit transaction for the bill payment
    });

    // Save the updated account and the transaction
    await account.save();
    await billTransaction.save();

    // Send response indicating success
    sendResponse(res, 200, true, "Bill payment successful", {
      account,
      transaction: billTransaction
    });
  } catch (error) {
    // Handle errors and send an appropriate response
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

    // Update the account balance
    account.balance += amount;
    await account.save();

    // Create a transaction record
    const transaction = new Transaction({
      accountId: account._id,
      amount,
      balance: account.balance,
      description: description ?? "Deposit",
      category: "deposit",
      type: "credit", // It's a credit to the account
      date: new Date()
    });


    await Account.deleteOne({ _id: accountId });


    sendResponse(res, 200, true, "Account deleted successfully");


  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};