import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  changePin,
  addSecurityQuestions,
  viewSecurityQuestions
} from "../controllers/user.controller";
import requireAuth from "../middlewares/requireAuth";

const router = express.Router();

router.use(requireAuth);

router.get("/get-profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/change-password", changePassword);
router.put("/change-pin", changePin);
router.put("/add-security-questions", addSecurityQuestions);
router.get("/get-security-questions", viewSecurityQuestions);

export default router;
