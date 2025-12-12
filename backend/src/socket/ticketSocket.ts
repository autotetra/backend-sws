import { io } from "../server";
import { TicketDocument } from "../models/ticketModel";

/**
 * Emit a ticket update event to:
 * - The ticket creator (private room)
 * - The assignee (private room)
 * - All Agent/Admin users (shared "staff" room)
 */

export const emitTicketCreated = (ticket: TicketDocument) => {
  // Emit to creator
  if (ticket.createdBy) {
    io.to(ticket.createdBy._id.toString()).emit("ticketCreated", ticket);
  }

  // Emit to assignee (if assigned)
  if (ticket.assignee) {
    io.to(ticket.assignee._id.toString()).emit("ticketCreated", ticket);
  }

  // Emit to the shared "staff" room (for admins/internal members)
  io.to("staff").emit("ticketCreated", ticket);
};

export const emitTicketUpdate = (ticket: TicketDocument) => {
  console.log("EMITTING to:", {
    createdBy: ticket.createdBy,
    createdByRoom: ticket.createdBy?._id?.toString(),
    assignee: ticket.assignee,
    assigneeRoom: ticket.assignee?._id?.toString(),
  });
  // Emit to creator
  if (ticket.createdBy) {
    io.to(ticket.createdBy._id.toString()).emit("ticketUpdated", ticket);
  }

  // Emit to assignee (if assigned)
  if (ticket.assignee) {
    io.to(ticket.assignee._id.toString()).emit("ticketUpdated", ticket);
  }

  // Emit to the shared "staff" room (for admins/internal members)
  io.to("staff").emit("ticketUpdated", ticket);
};

export const emitTicketDelete = (ticket: TicketDocument) => {
  const typedTicket = ticket as TicketDocument;
  const ticketId = typedTicket._id.toString();

  // Emit to creator
  if (typedTicket.createdBy) {
    io.to(typedTicket.createdBy._id.toString()).emit("ticketDeleted", ticketId);
  }

  // Emit to assignee (if assigned)
  if (typedTicket.assignee) {
    io.to(typedTicket.assignee._id.toString()).emit("ticketDeleted", ticketId);
  }

  // Emit to the shared "staff" room (for admins/internal members)
  io.to("staff").emit("ticketDeleted", ticketId);
};
