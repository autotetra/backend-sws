import { Request, Response } from "express";
import User from "../models/userModel";

// GET /api/admin/users  (currently only admin uses it)
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role, departments } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password, // hashed by pre-save hook
      role: role || "user", // admin can set role, default to "user"
      departments: departments || [],
    });

    const safeUser = newUser.toObject();
    delete (safeUser as any).password;

    res.status(201).json({
      message: "User created successfully.",
      user: safeUser,
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };

    // Remove protected fields
    delete updates._id;
    delete updates.createdAt;
    delete updates.password;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    Object.assign(user, updates);
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
