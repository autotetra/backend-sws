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

export default createTicket;
