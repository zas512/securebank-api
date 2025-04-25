"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardOverview = void 0;
const account_model_1 = __importDefault(require("../models/account.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const getDashboardOverview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized");
            return;
        }
        // Fetch all user accounts
        const accounts = yield account_model_1.default.find({ userId, status: true });
        // Calculate total balance
        const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);
        // Count accounts by type
        const accountTypeCounts = {};
        accounts.forEach((account) => {
            const type = account.type.toLowerCase();
            accountTypeCounts[type] = (accountTypeCounts[type] || 0) + 1;
        });
        // Fetch recent transactions (limit 5, latest first)
        const recentTransactions = yield transaction_model_1.default.find({ accountId: { $in: accounts.map((a) => a._id) } })
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
        (0, responseHelper_1.default)(res, 200, true, "Dashboard overview fetched successfully", dashboardData);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.getDashboardOverview = getDashboardOverview;
