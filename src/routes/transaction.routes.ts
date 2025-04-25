import { Router } from "express";
import { getTransactions, getTransactionDetails } from "../controllers/transaction.controller";
import requireAuth from "../middlewares/requireAuth";

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.get("/", getTransactions);
router.get("/:transactionId", getTransactionDetails);

export default router; 