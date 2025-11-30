import { Response } from "express";
import { CustomRequest } from "../../types/express/custom";
import { Ticket } from "../models/ticketModel";
import { User, IUser } from "../models/userModel";
import { canManageTicket } from "../utils/ticketPermissions";
import { emitTicketUpdate, emitTicketDelete } from "../socket/ticketSocket";
import { io } from "../server";

export const createTicket = async (req: CustomRequest, res: Response) => {
  try {
    const { title, description, category } = req.body;
    const createdBy = req.user?.id;

    // 1. Get Agents (NOT LEAN — we want real Mongoose docs)
    const agentMembers: IUser[] = await User.find({
      role: "agent",
      departments: category,
    });

    let assignee: string | null = null;

    if (agentMembers.length > 0) {
      // 2. Count open tickets for each internal member
      const membersWithCounts = await Promise.all(
        agentMembers.map(async (member) => {
          const openCount = await Ticket.countDocuments({
            assignee: member._id,
            status: "open",
          });

          return { member, openCount };
        })
      );

      // 3. Pick the member with the fewest open tickets
      membersWithCounts.sort((a, b) => a.openCount - b.openCount);

      // 4. Assign
      assignee = membersWithCounts[0].member._id.toString();
    }

    // 5. Create ticket
    const ticket = await Ticket.create({
      title,
      description,
      category,
      createdBy,
      assignee,
    });

    console.log("New ticket created:", ticket);

    emitTicketUpdate(ticket);

    res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
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

    res.status(200).json(tickets);
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

    const { canModify } = canManageTicket(req, ticket);

    if (!canModify) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json(ticket);
  } catch (err) {
    console.error("Error fetching ticket:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateTicket = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    // console.log(user, ticket);
    const { canModify } = canManageTicket(req, ticket);

    if (!canModify) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this ticket." });
    }

    // 🛑 Agents can only assign to themselves
    if (
      user.role === "agent" &&
      updates.assignee &&
      updates.assignee !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Agent users can only assign themselves." });
    }

    // 🛑 Normal users can never assign tickets
    if (user.role === "user" && updates.assignee) {
      return res
        .status(403)
        .json({ message: "Users are not allowed to assign tickets." });
    }

    Object.assign(ticket, updates);
    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "firstName lastName email role")
      .populate("assignee", "firstName lastName email role");

    // Emit ticket update event via WebSocket
    if (populatedTicket) {
      emitTicketUpdate(populatedTicket);
    }

    res.status(200).json(populatedTicket);
  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteTicket = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const { canModify } = canManageTicket(req, ticket);

    if (!canModify) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this ticket." });
    }

    await Ticket.findByIdAndDelete(id);

    // Emit ticket deletion event via WebSocket
    emitTicketDelete(ticket);

    res.status(200).json({ message: "Ticket deleted successfully." });
  } catch (err) {
    console.error("Error deleting ticket:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const addCommentToTicket = async (req: CustomRequest, res: Response) => {
  try {
    const ticketId = req.params.id;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const { body } = req.body;
    if (!body || body.trim() === "") {
      return res.status(400).json({ message: "Comment body is required." });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    // Add comment
    ticket.comments.push({
      author: user._id,
      body,
    } as any);

    await ticket.save();

    const updated = await Ticket.findById(ticketId)
      .populate("createdBy", "firstName lastName email role")
      .populate("assignee", "firstName lastName email role")
      .populate("comments.author", "firstName lastName email role");

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export default createTicket;
