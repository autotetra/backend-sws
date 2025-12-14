import { io } from "../server";
import { TicketDocument } from "../models/ticketModel";

/**
 * Socket emission helpers for ticket lifecycle events.
 *
 * Events are delivered to:
 * - Ticket creator (private user room)
 * - Ticket assignee (private user room)
 * - Staff room (Agents & Admins)
 *
 * This file contains NO business logic.
 * It only routes already-validated events.
 */

export const emitTicketCreated = (ticket: TicketDocument) => {
  // Notify ticket creator
  if (ticket.createdBy) {
    io.to(ticket.createdBy._id.toString()).emit("ticketCreated", ticket);
  }

  // Notify assigned agent (if any)
  if (ticket.assignee) {
    io.to(ticket.assignee._id.toString()).emit("ticketCreated", ticket);
  }

  // Notify all staff members
  io.to("staff").emit("ticketCreated", ticket);
};

export const emitTicketUpdated = (ticket: TicketDocument) => {
  // Notify ticket creator
  if (ticket.createdBy) {
    io.to(ticket.createdBy._id.toString()).emit("ticketUpdated", ticket);
  }

  // Notify assigned agent (if any)
  if (ticket.assignee) {
    io.to(ticket.assignee._id.toString()).emit("ticketUpdated", ticket);
  }

  // Notify all staff members
  io.to("staff").emit("ticketUpdated", ticket);
};

export const emitTicketDeleted = (ticket: TicketDocument) => {
  const ticketId = ticket._id.toString();

  // Notify ticket creator
  if (ticket.createdBy) {
    io.to(ticket.createdBy._id.toString()).emit("ticketDeleted", ticketId);
  }

  // Notify assigned agent (if any)
  if (ticket.assignee) {
    io.to(ticket.assignee._id.toString()).emit("ticketDeleted", ticketId);
  }

  // Notify all staff members
  io.to("staff").emit("ticketDeleted", ticketId);
};
