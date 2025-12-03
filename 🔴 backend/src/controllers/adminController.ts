import { Request, Response } from "express";
import { CustomRequest } from "../../types/express/custom";
import User from "../models/userModel";
import { Ticket } from "../models/ticketModel";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createUserAsAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role, departments } =
      req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(404).json({ message: "Missing required fields" });
    }

    const existinUser = await User.findOne({ email });
    if (existinUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    let dept = [];
    if (role === "agent") {
      if (
        !departments ||
        !Array.isArray(departments) ||
        departments.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Agent must have a department" });
      }
      dept = departments;
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      departments: dept,
    });

    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.params.id;

    // Safety: prevent Admin deleting themselves
    if (req.user?.id === userId) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminCreateTicket = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      category,
      createdBy,
      assignee,
    } = req.body;

    if (!title || !createdBy) {
      return res
        .status(400)
        .json({ message: "title and createdBy are required" });
    }

    const ticket = await Ticket.create({
      title,
      description,
      status,
      priority,
      category,
      createdBy,
      assignee: assignee || null,
    });

    const populated = await Ticket.findById(ticket._id)
      .populate("createdBy", "firstName lastName")
      .populate("assignee", "firstName lastName");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Admin create ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDeleteTicket = async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.id;

    const deleted = await Ticket.findByIdAndDelete(ticketId);
    if (!deleted) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket deleted" });
  } catch (err) {
    console.error("Admin delete ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
