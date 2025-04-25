import User from "../models/user.model";
import type { Request, Response } from "express";
import sendResponse from "../utils/responseHelper";
import bcrypt from "bcryptjs";
import { comparePassword } from "../utils/bcrypt";

interface SecurityQuestion {
  question: string;
  answer: string;
}

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select("-password -pin");
    if (!user) {
      sendResponse(res, 404, false, "User not found");
      return;
    }
    sendResponse(res, 200, true, "User profile retrieved", { user });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, address, dob } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { name, phone, address, dob },
      { new: true }
    ).select("-password -pin");

    if (!user) {
      sendResponse(res, 404, false, "User not found");
      return;
    }

    sendResponse(res, 200, true, "Profile updated successfully", { user });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      sendResponse(res, 404, false, "User not found");
      return;
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      sendResponse(res, 400, false, "Current password is incorrect");
      return;
    }

    user.password = newPassword;
    await user.save();

    sendResponse(res, 200, true, "Password changed successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};

export const changePin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPin, newPin } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      sendResponse(res, 404, false, "User not found");
      return;
    }

    const isMatch = await bcrypt.compare(currentPin, user.pin);
    if (!isMatch) {
      sendResponse(res, 400, false, "Current PIN is incorrect");
      return;
    }

    user.pin = newPin;
    await user.save();

    sendResponse(res, 200, true, "PIN changed successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};

export const addSecurityQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { securityQuestions }: { securityQuestions: SecurityQuestion[] } = req.body;

    if (!userId) {
      sendResponse(res, 401, false, "Unauthorized");
      return;
    }

    if (!securityQuestions || securityQuestions.length === 0) {
      sendResponse(res, 400, false, "Security questions are required");
      return;
    }

    // Validate each security question
    securityQuestions.forEach((q: SecurityQuestion) => {
      if (!q.question || !q.answer) {
        sendResponse(res, 400, false, "Each security question must have a question and an answer");
      }
    });

    // Update the user's security questions
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { securityQuestions },
      { new: true }
    ).select("-password -pin");

    if (!updatedUser) {
      sendResponse(res, 404, false, "User not found");
      return;
    }

    sendResponse(res, 200, true, "Security questions added successfully", { updatedUser });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};

export const viewSecurityQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendResponse(res, 401, false, "Unauthorized");
      return;
    }

    const user = await User.findById(userId).select("securityQuestions -_id");

    if (!user) {
      sendResponse(res, 404, false, "User not found");
      return;
    }

    sendResponse(res, 200, true, "Security questions retrieved", { securityQuestions: user.securityQuestions });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};
