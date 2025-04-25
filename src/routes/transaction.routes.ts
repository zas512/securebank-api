import { Router } from "express";
import { getTransactions, getTransactionDetails, handleTransaction } from "../controllers/transaction.controller";
import requireAuth from "../middlewares/requireAuth";

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.get("/get", getTransactions);
router.get("/:transactionId", getTransactionDetails);
router.post("/do-transaction", handleTransaction);
export default router;  