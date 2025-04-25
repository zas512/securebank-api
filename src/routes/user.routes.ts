import express from "express";
import { updateUserProfile } from "../controllers/user.controller";
import requireAuth from "../middlewares/requireAuth";

const router = express.Router();

router.use(requireAuth);
router.put("/profile", updateUserProfile);

export default router;
