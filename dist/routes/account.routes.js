"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_controller_1 = require("../controllers/account.controller");
const requireAuth_1 = __importDefault(require("../middlewares/requireAuth"));
const router = (0, express_1.Router)();
router.use(requireAuth_1.default);
router.post("/create-account", account_controller_1.createAccount);
router.get("/get-accounts", account_controller_1.getAccounts);
router.post("/transfer-money", account_controller_1.transferMoney);
router.get("/get-account-details/:accountId", account_controller_1.getAccountDetails);
router.post("/pay-bill", account_controller_1.payBill);
router.delete("/account/:accountId", account_controller_1.deleteAccount);
exports.default = router;
