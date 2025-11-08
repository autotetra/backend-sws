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
  const isAssignee = ticket.assignee?.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  return {
    isOwner,
    isAssignee,
    isAdmin,
    canModify: isOwner || isAssignee || isAdmin,
  };
}
