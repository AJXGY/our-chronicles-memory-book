import { Memory } from "../types";

const ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_ZHIPU_API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  return apiKey;
};

// Helper function to call Zhipu AI API
const callZhipuAI = async (
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.7,
  responseFormat?: { type: string }
): Promise<string> => {
  const apiKey = getApiKey();

  const requestBody: any = {
    model: "glm-4-flash",
    messages,
    temperature,
  };

  if (responseFormat) {
    requestBody.response_format = responseFormat;
  }

  const response = await fetch(ZHIPU_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Zhipu AI API Error:", errorText);
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

// 1. Emotional Narrator: Generates poetic caption
export const generateNarrative = async (memory: Memory): Promise<string> => {
  try {
    const prompt = `
      扮演一位为情侣纪念册撰写文案的浪漫作家。
      请用中文为标题为 "${memory.title}" 的回忆写一段简短、充满诗意且温馨的旁白（不超过2句话）。
      上下文背景: ${memory.description}.
      地点: ${memory.location}.
      氛围: ${memory.mood}.
      语气应该是亲密、怀旧且深情的。
    `;

    const messages = [
      {
        role: "user",
        content: prompt,
      },
    ];

    const result = await callZhipuAI(messages, 0.8);
    return result || "爱在细节中,但有时言语无法表达。";
  } catch (error) {
    console.error("Narrative generation failed", error);
    return "这一刻胜过千言万语。";
  }
};

// 2. Memory Chatbot: RAG-like chat based on memory context
export const chatWithMemories = async (
  memories: Memory[],
  history: { role: string; parts: { text: string }[] }[],
  userMessage: string
): Promise<string> => {
  try {
    // Create a context summary from memories
    const contextSummary = memories
      .map(
        (m) =>
          `- 在 ${m.date} 于 ${m.location}: ${m.title} (${
            m.description
          }). 标签: ${m.tags.join(", ")}`
      )
      .join("\n");

    const systemInstruction = `
      你是 "Chronos",这本情侣时光书的数字灵魂。
      你拥有他们共同的历史记忆：
      ${contextSummary}
      
      请用温暖、中文的语气回答他们的问题。
      如果问到数据中没有的事情,可以调皮地建议他们快去创造这个回忆。
      回答请简洁（不超过3句话）,除非被要求讲故事。
    `;

    // Convert history format from Gemini to Zhipu
    const zhipuHistory = history.map((msg) => ({
      role: msg.role === "model" ? "assistant" : msg.role,
      content: msg.parts[0].text,
    }));

    const messages = [
      {
        role: "system",
        content: systemInstruction,
      },
      ...zhipuHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    const result = await callZhipuAI(messages, 0.7);
    return result || "我在回忆的长河中迷路了...";
  } catch (error) {
    console.error("Chat failed", error);
    return "我现在有点想不起来了。";
  }
};

// 3. Anniversary Quiz: Generates a question based on memories
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number; // 0-3
  explanation: string;
}

export const generateQuiz = async (
  memories: Memory[]
): Promise<QuizQuestion | null> => {
  try {
    // Randomly select a few memories to base the question on
    const shuffled = [...memories].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const contextStr = JSON.stringify(selected);

    const prompt = `
      根据以下回忆内容创建一个有趣的中文多项选择题（Trivia）：${contextStr}。
      问题应该测试关于地点、日期或具体细节的记忆。
      提供4个选项,只有一个是正确的。
      请以JSON格式返回,格式如下:
      {
        "question": "问题内容",
        "options": ["选项1", "选项2", "选项3", "选项4"],
        "correctIndex": 0,
        "explanation": "答案解释"
      }
      
      注意: correctIndex 是 0-3 之间的整数,表示正确答案在 options 数组中的索引。
    `;

    const messages = [
      {
        role: "user",
        content: prompt,
      },
    ];

    const result = await callZhipuAI(messages, 0.7, { type: "json_object" });

    if (!result) return null;

    // Parse and validate the JSON response
    const parsed = JSON.parse(result) as QuizQuestion;

    // Validate the structure
    if (
      !parsed.question ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 4 ||
      typeof parsed.correctIndex !== "number" ||
      parsed.correctIndex < 0 ||
      parsed.correctIndex > 3 ||
      !parsed.explanation
    ) {
      console.error("Invalid quiz format:", parsed);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Quiz generation failed", error);
    return null;
  }
};
