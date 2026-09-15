/** Prefer a model a new key can call. Override with OPENAI_MODEL. */
export function openaiModels(): string[] {
  const preferred = process.env.OPENAI_MODEL?.trim();
  const list = preferred ? [preferred, "gpt-4o-mini", "gpt-4o"] : ["gpt-4o-mini", "gpt-4o"];
  return [...new Set(list)];
}
