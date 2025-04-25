import { Router } from "express";
import { createAccount, getAccounts, transferMoney } from "../controllers/account.controller";
import requireAuth from "../middlewares/requireAuth";

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.post("/", createAccount);
router.get("/", getAccounts);
router.post("/transfer", transferMoney);

export default router; 