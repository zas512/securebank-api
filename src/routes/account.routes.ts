import { Router } from "express";
import { createAccount, getAccounts, transferMoney, payBill, getAccountDetails, deleteAccount } from "../controllers/account.controller";
import requireAuth from "../middlewares/requireAuth";

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.post("/create-account", createAccount);
router.get("/get-accounts", getAccounts);
router.post("/transfer-money", transferMoney);
router.get("/get-account-details/:accountId", getAccountDetails);
router.post("/pay-bill", payBill);
router.delete("/account/:accountId", deleteAccount);



export default router; 