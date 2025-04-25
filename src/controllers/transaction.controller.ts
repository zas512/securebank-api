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

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate, type, category } = req.query;

    // Get user's accounts
    const userAccounts = await Account.find({ userId });
    const accountIds = userAccounts.map((account) => account._id);

    // Build query
    const query: FilterQuery<TransactionQuery> = { accountId: { $in: accountIds } };

    if (startDate) {
      query.date = { ...query.date, $gte: new Date(startDate as string) };
    }

    if (endDate) {
      query.date = { ...query.date, $lte: new Date(endDate as string) };
    }

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    const transactions = await Transaction.find(query).sort({ date: -1 }).populate("accountId", "number type");

    sendResponse(res, 200, true, "Transactions retrieved successfully", { transactions });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};

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
