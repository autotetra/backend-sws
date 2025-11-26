import mongoose from "mongoose";
import { Document, Types } from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["open", "in_progress", "closed"],
      default: "open",
    },
    category: {
      type: String,
      enum: ["billing", "technical", "general"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },

  { timestamps: true }
);

export interface TicketDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: "open" | "in_progress" | "closed";
  category: "billing" | "technical" | "general";
  priority: "low" | "medium" | "high";
  createdBy: Types.ObjectId;
  assignee?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export const Ticket = mongoose.model<TicketDocument>("Ticket", ticketSchema);
