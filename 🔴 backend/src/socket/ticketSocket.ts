import { io } from "../server";
import { TicketDocument } from "../models/ticketModel";

/**
 * Emit a ticket update event to:
 * - The ticket creator (private room)
 * - The assignee (private room)
 * - All internal/admin users (shared "staff" room)
 */
export const emitTicketUpdate = (ticket: TicketDocument) => {
  // Emit to creator
  if (ticket.createdBy) {
    io.to(ticket.createdBy.toString()).emit("ticketUpdated", ticket);
  }

  // Emit to assignee (if assigned)
  if (ticket.assignee) {
    io.to(ticket.assignee.toString()).emit("ticketUpdated", ticket);
  }

  // Emit to the shared "staff" room (for admins/internal members)
  io.to("staff").emit("ticketUpdated", ticket);
};

export const emitTicketDelete = (ticket: TicketDocument) => {
  const typedTicket = ticket as TicketDocument;
  const ticketId = typedTicket._id.toString();

  if (typedTicket.createdBy) {
    io.to(typedTicket.createdBy.toString()).emit("ticketDeleted", ticketId);
  }

  if (typedTicket.assignee) {
    io.to(typedTicket.assignee.toString()).emit("ticketDeleted", ticketId);
  }

  io.to("staff").emit("ticketDeleted", ticketId);
};

export const emitTicketCreated = (ticket: TicketDocument) => {
  if (ticket.createdBy) {
    io.to(ticket.createdBy.toString()).emit("ticketCreated", ticket);
  }

  if (ticket.assignee) {
    io.to(ticket.assignee.toString()).emit("ticketCreated", ticket);
  }

  io.to("staff").emit("ticketCreated", ticket);
};
