import User from "../models/user.model";
import Account from "../models/account.model";
import Transaction from "../models/transaction.model";
import { Request, Response } from "express";
import sendResponse from "../utils/responseHelper";

export const getAllUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, "-password -pin -securityAnswers");

    const accounts = await Account.find({}).populate("userId", "name email");
    const transactions = await Transaction.find({}).populate([
      { path: "accountId", select: "number type userId", populate: { path: "userId", select: "name email" } },
      { path: "fromAccountId", select: "number type userId", populate: { path: "userId", select: "name email" } },
      { path: "toAccountId", select: "number type userId", populate: { path: "userId", select: "name email" } }
    ]);

    sendResponse(res, 200, true, "Admin data retrieved successfully", {
      users,
      accounts,
      transactions
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};
