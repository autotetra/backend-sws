import { openai } from "./aiClient";

export type TicketCategory = "Billing" | "Technical" | "General";
export type TicketPriority = "Low" | "Medium" | "High";

export type TicketClassification = {
  category: TicketCategory;
  priority: TicketPriority;
  confidence: number;
  reasoning: string;
};

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function isValidCategory(x: any): x is TicketCategory {
  return x === "Technical" || x === "Billing" || x === "General";
}

function isValidPriority(x: any): x is TicketPriority {
  return x === "Low" || x === "Medium" || x === "High";
}

function validateClasssification(obj: any): TicketClassification {
  if (!obj || typeof obj !== "object")
    throw new Error("Invalid AI output (not an object)");

  const { category, priority, confidence, reasoning } = obj;

  if (!isValidCategory(category))
    throw new Error("Invalid AI output (invalid category)");
  if (!isValidPriority(priority))
    throw new Error("Invalid AI output (invalid priority)");

  const conf = clamp01(Number(confidence));
  const reason = typeof reasoning === "string" ? reasoning.trim() : "";

  return {
    category,
    priority,
    confidence: conf,
    reasoning: reason.slice(0, 240),
  };
}
