import User from "../models/user.model";
import Account from "../models/account.model";
import Transaction from "../models/transaction.model";
import { Request, Response } from "express";
import sendResponse from "../utils/responseHelper";

export const getAllUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, "-password -pin -securityAnswers");
    const accounts = await Account.find({});
    const transactions = await Transaction.find({}).populate([
      { path: "accountId", select: "number type userId" },
      { path: "fromAccountId", select: "number type userId" },
      { path: "toAccountId", select: "number type userId" }
    ]);

    // Map userId to their accounts
    const accountsMap = new Map<string, typeof accounts>();
    accounts.forEach(account => {
      const userId = account.userId.toString();
      if (!accountsMap.has(userId)) accountsMap.set(userId, []);
      accountsMap.get(userId)?.push(account);
    });

    // Map userId to their transactions
    const transactionsMap = new Map<string, typeof transactions>();
    transactions.forEach(txn => {
      const userIds: string[] = [];

      if ((txn.accountId as any)?.userId) userIds.push((txn.accountId as any).userId.toString());
      if ((txn.fromAccountId as any)?.userId) userIds.push((txn.fromAccountId as any).userId.toString());
      if ((txn.toAccountId as any)?.userId) userIds.push((txn.toAccountId as any).userId.toString());

      userIds.forEach(id => {
        if (!transactionsMap.has(id)) transactionsMap.set(id, []);
        transactionsMap.get(id)?.push(txn);
      });
    });

    // Construct final result
    const result = users.map(user => {
      const id = user._id.toString();
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        accounts: accountsMap.get(id) || [],
        transactions: transactionsMap.get(id) || []
      };
    });

    sendResponse(res, 200, true, "Admin data retrieved successfully", result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};


