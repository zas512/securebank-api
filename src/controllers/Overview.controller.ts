import type { Request, Response } from "express";
import Account from "../models/account.model";
import Transaction from "../models/transaction.model";
import sendResponse from "../utils/responseHelper";

export const getDashboardOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      sendResponse(res, 401, false, "Unauthorized");
      return;
    }

    // Fetch all user accounts
    const accounts = await Account.find({ userId, status: true });

    // Calculate total balance
    const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

    // Count accounts by type
    const accountTypeCounts: Record<string, number> = {};
    accounts.forEach((account) => {
      const type = account.type.toLowerCase();
      accountTypeCounts[type] = (accountTypeCounts[type] || 0) + 1;
    });

    // Fetch recent transactions (limit 5, latest first)
    const recentTransactions = await Transaction.find({ accountId: { $in: accounts.map((a) => a._id) } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Count deposits and withdrawals
    const depositCount = recentTransactions.filter((txn) => txn.type === "credit").length;
    const withdrawalCount = recentTransactions.filter((txn) => txn.type === "debit").length;

    // Format accounts for frontend (mask account number)
    const formattedAccounts = accounts.map((account) => ({
      name: account.type.charAt(0).toUpperCase() + account.type.slice(1),
      number: "****" + account.number.slice(-4),
      balance: account.balance
    }));

    // Final response
    const dashboardData = {
      totalBalance,
      activeAccounts: {
        count: accounts.length,
        breakdown: accountTypeCounts
      },
      recentTransactionsOverview: {
        total: depositCount + withdrawalCount,
        deposits: depositCount,
        withdrawals: withdrawalCount
      },
      accounts: formattedAccounts,
      recentTransactions
    };

    sendResponse(res, 200, true, "Dashboard overview fetched successfully", dashboardData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};
