import { Types } from "mongoose";
import { CustomRequest } from "../../types/express/custom";
import { TicketDocument } from "../models/ticketModel";

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

  const isOwner = ticket.createdBy.equals(user._id as Types.ObjectId);
  const isAssignee =
    ticket.assignee &&
    // If populated: ticket.assignee._id
    (ticket.assignee._id?.toString?.() === user._id.toString() ||
      // If NOT populated: plain ObjectId
      ticket.assignee.toString?.() === user._id.toString());
  const isAdmin = user.role === "Admin";

  return {
    isOwner,
    isAssignee,
    isAdmin,
    canModify: isOwner || isAssignee || isAdmin,
  };
}
