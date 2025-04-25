"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_controller_1 = require("../controllers/account.controller");
const requireAuth_1 = __importDefault(require("../middlewares/requireAuth"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(requireAuth_1.default);
router.post("/", account_controller_1.createAccount);
router.get("/", account_controller_1.getAccounts);
router.post("/transfer", account_controller_1.transferMoney);
exports.default = router;
