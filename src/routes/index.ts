import { Router } from "express";
import authRoutes from "./auth.routes";
import accountRoutes from "./account.routes";
import transactionRoutes from "./transaction.routes";
import userRoutes from "./user.routes";
import overviewRoutes from "./overview.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/accounts", accountRoutes);
router.use("/transactions", transactionRoutes);
router.use("/user", userRoutes);
router.use("/overview", overviewRoutes);
router.use("/admin", adminRoutes);

export default router;
