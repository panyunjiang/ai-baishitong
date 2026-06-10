import OpenAI from "openai";

const llm = new OpenAI({
  apiKey: process.env.LLM_API_KEY || "",
  baseURL: process.env.LLM_BASE_URL || "https://api.deepseek.com/v1",
  timeout: 120000,
});

const MODEL = process.env.LLM_MODEL || "deepseek-chat";

export async function generateText(prompt: string): Promise<string> {
  if (!process.env.LLM_API_KEY) throw new Error("LLM_API_KEY is required");

  const response = await llm.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "你是一位专业的AI行业内容创作者，擅长写资讯文章、工具评测和技术教程。输出高质量的Markdown格式内容。",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const fullPrompt = `${prompt}\n\n请严格输出JSON格式，不要包含任何markdown代码块标记，直接输出纯JSON。`;

  const response = await llm.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "你是一个JSON数据生成器。只输出有效的JSON，不包含任何解释或markdown标记。",
      },
      { role: "user", content: fullPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "{}";
  // Clean up any accidental markdown fences
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  return JSON.parse(cleaned);
}
