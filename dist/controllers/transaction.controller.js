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
exports.getTransactionDetails = exports.getTransactions = void 0;
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const account_model_1 = __importDefault(require("../models/account.model"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { startDate, endDate, type, category } = req.query;
        // Get user's accounts
        const userAccounts = yield account_model_1.default.find({ userId });
        const accountIds = userAccounts.map((account) => account._id);
        // Build query
        const query = { accountId: { $in: accountIds } };
        if (startDate) {
            query.date = Object.assign(Object.assign({}, query.date), { $gte: new Date(startDate) });
        }
        if (endDate) {
            query.date = Object.assign(Object.assign({}, query.date), { $lte: new Date(endDate) });
        }
        if (type) {
            query.type = type;
        }
        if (category) {
            query.category = category;
        }
        const transactions = yield transaction_model_1.default.find(query).sort({ date: -1 }).populate("accountId", "number type");
        (0, responseHelper_1.default)(res, 200, true, "Transactions retrieved successfully", { transactions });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.getTransactions = getTransactions;
const getTransactionDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { transactionId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Get user's accounts
        const userAccounts = yield account_model_1.default.find({ userId });
        const accountIds = userAccounts.map((account) => account._id);
        const transaction = yield transaction_model_1.default.findOne({
            _id: transactionId,
            accountId: { $in: accountIds }
        }).populate("accountId", "number type");
        if (!transaction) {
            (0, responseHelper_1.default)(res, 404, false, "Transaction not found");
            return;
        }
        (0, responseHelper_1.default)(res, 200, true, "Transaction details retrieved successfully", { transaction });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.getTransactionDetails = getTransactionDetails;
