import User from "../models/user.model";
import type { Request, Response } from "express";
import sendResponse from "../utils/responseHelper";

type UpdateFields = {
  name?: string;
  phone?: string;
  address?: string;
  dob?: Date;
  email?: string;
  securityQuestion1?: string;
  securityQuestion2?: string;
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, address, dob, email, securityQuestion1, securityQuestion2 } = req.body as UpdateFields;

    const updateFields: UpdateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (dob !== undefined) updateFields.dob = dob;
    if (email !== undefined) updateFields.email = email;
    if (securityQuestion1 !== undefined) updateFields.securityQuestion1 = securityQuestion1;
    if (securityQuestion2 !== undefined) updateFields.securityQuestion2 = securityQuestion2;

    if (Object.keys(updateFields).length === 0) {
      sendResponse(res, 400, false, "No fields provided for update");
      return;
    }

    const user = await User.findByIdAndUpdate(req.user?.id, { $set: updateFields }, { new: true }).select(
      "-password -pin"
    );

    if (!user) {
      sendResponse(res, 404, false, "User not found");
      return;
    }

    sendResponse(res, 200, true, "Profile updated successfully", { user });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};
