import { openai } from "./aiClient";

export async function askAI(prompt: string) {
  const res = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });
  return res.output_text;
}
