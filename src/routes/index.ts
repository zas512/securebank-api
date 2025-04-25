import { Router } from "express";
import authRoutes from "./auth.routes";
import accountRoutes from "./account.routes";
import transactionRoutes from "./transaction.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/accounts", accountRoutes);
router.use("/transactions", transactionRoutes);

export default router;
