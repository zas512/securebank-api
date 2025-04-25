import { Router } from "express";
import { getDashboardOverview } from "../controllers/Overview.controller";
import requireAuth from "../middlewares/requireAuth";

const router = Router();

// All routes require authentication
router.use(requireAuth);
router.get("/get-overview", getDashboardOverview);

export default router;
