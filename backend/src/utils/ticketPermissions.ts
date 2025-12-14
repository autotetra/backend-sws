import { CustomRequest } from "../../types/express/custom";
import { TicketDocument } from "../models/ticketModel";

/**
 * Determines the relationship of the request user to a ticket
 * and whether they are allowed to modify it.
 */
export function canManageTicket(req: CustomRequest, ticket: TicketDocument) {
  const user = req.user;

  if (!user) {
    return {
      isOwner: false,
      isAssignee: false,
      isAdmin: false,
      canModify: false,
    };
  }

  const userId = user._id.toString();

  // Ticket creator
  const isOwner = ticket.createdBy?.toString() === userId;

  // Ticket assignee (supports populated or raw ObjectId)
  const isAssignee =
    !!ticket.assignee &&
    (ticket.assignee._id?.toString?.() === userId ||
      ticket.assignee.toString?.() === userId);

  // Admin override
  const isAdmin = user.role === "Admin";

  return {
    isOwner,
    isAssignee,
    isAdmin,
    canModify: isOwner || isAssignee || isAdmin,
  };
}
