import { Response } from "express";
import { CustomRequest } from "../../types/express/custom";
import { Ticket } from "../models/ticket.model";

// @desc Create a new ticket
// @route POST /api/tickets
// @access Private (user only)

export const createTicket = async (req: CustomRequest, res: Response) => {
  try {
    const { title, description, category } = req.body;

    const createdBy = req.user?.id;

    const ticket = await Ticket.create({
      title,
      description,
      category,
      createdBy,
      assignee: null,
    });

    res.status(201).json({ message: "Ticket created succesfully", ticket });
  } catch (err) {
    console.error("Create ticket error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

export const getTickets = async (req: CustomRequest, res: Response) => {
  try {
    let filter = {};

    // Role-based access
    if (req.user?.role === "user") {
      filter = { createdBy: req.user.id };
    } else if (req.user?.role === "agent") {
      filter = { assignee: req.user.id };
    } // Admins can see all tickets (no filter)

    const tickets = await Ticket.find(filter)
      .populate("createdBy", "firstName lastName email role")
      .populate("assignee", "firstName lastName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ tickets });
  } catch (err) {
    console.error("Get tickets errpr:", err);
    res.status(500).json({ message: 'Server error."});' });
  }
};

export const getTicketById = async (req: CustomRequest, res: Response) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "firstName lastName email role")
      .populate("assignee", "firstName lastName email role");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const user = req.user; // comes from requireAuth middleware

    // RBAC Check: only allow:
    // - ticket creator
    // - ticket assignee (internal)
    // - or admin
    const isOwner = ticket.createdBy._id.equals(user._id);
    const isAssignee = ticket.assignee?.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAssignee && !isAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json(ticket);
  } catch (err) {
    console.error("Error fetching ticket:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export default createTicket;
