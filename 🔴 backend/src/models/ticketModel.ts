import mongoose from "mongoose";
import { Document, Types } from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open",
    },
    category: {
      type: String,
      enum: ["Billing", "Technical", "General"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
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
    comments: [commentSchema],
  },

  { timestamps: true }
);

export interface TicketDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: "Open" | "In Progress" | "Closed";
  category: "Billing" | "Techincal" | "General";
  priority: "Low" | "Medium" | "High";
  createdBy: Types.ObjectId;
  assignee?: Types.ObjectId | null;
  comments: {
    _id: Types.ObjectId;
    author: Types.ObjectId;
    body: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export const Ticket = mongoose.model<TicketDocument>("Ticket", ticketSchema);
