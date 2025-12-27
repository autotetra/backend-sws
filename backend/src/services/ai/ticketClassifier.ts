import { openai } from "./aiClient";

export type TicketCategory = "Technical" | "Billing" | "General";
export type TicketPriority = "Low" | "Medium" | "High";

export type TicketClassification = {
  category: TicketCategory;
  priority: TicketPriority;
  confidence: number; // 0..1
  reasoning: string; // short reason, not a novel
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

function validateClassification(obj: any): TicketClassification {
  if (!obj || typeof obj !== "object")
    throw new Error("Invalid AI output (not an object)");

  const { category, priority, confidence, reasoning } = obj;

  if (!isValidCategory(category)) throw new Error("Invalid AI output.category");
  if (!isValidPriority(priority)) throw new Error("Invalid AI output.priority");

  const conf = clamp01(Number(confidence));
  const reason = typeof reasoning === "string" ? reasoning.trim() : "";

  return {
    category,
    priority,
    confidence: conf,
    reasoning: reason.slice(0, 240), // keep it short
  };
}

export async function classifyTicket(params: {
  title: string;
  description?: string;
}): Promise<TicketClassification> {
  const title = (params.title || "").trim();
  const description = (params.description || "").trim();

  const input = `
You are a support ticket classifier.

Return ONLY a JSON object with these keys:
- category: one of ["Technical","Billing","General"]
- priority: one of ["Low","Medium","High"]
- confidence: number from 0 to 1
- reasoning: short explanation (max 2 sentences)

Rules:
- If it mentions payments, invoices, subscriptions, refunds => Billing
- If it mentions bugs, errors, login issues, performance, integration failures => Technical
- Otherwise => General

Ticket:
Title: ${title}
Description: ${description}
  `.trim();

  const model = process.env.AI_MODEL || "gpt-4.1-mini";

  const resp = await openai.responses.create({
    model,
    input,
    // IMPORTANT: We force JSON
    text: { format: { type: "json_object" } },
  });

  // Responses API usually returns text in output[0].content[0].text
  const text = resp.output_text;
  if (!text) throw new Error("No AI text returned");

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("AI returned non-JSON text");
  }

  return validateClassification(parsed);
}
