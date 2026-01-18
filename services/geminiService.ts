import { GoogleGenAI, Type } from "@google/genai";
import { Memory } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  return new GoogleGenAI({ apiKey });
};

// 1. Emotional Narrator: Generates poetic caption
export const generateNarrative = async (memory: Memory): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      扮演一位为情侣纪念册撰写文案的浪漫作家。
      请用中文为标题为 "${memory.title}" 的回忆写一段简短、充满诗意且温馨的旁白（不超过2句话）。
      上下文背景: ${memory.description}.
      地点: ${memory.location}.
      氛围: ${memory.mood}.
      语气应该是亲密、怀旧且深情的。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "爱在细节中，但有时言语无法表达。";
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
    const ai = getClient();
    
    // Create a context summary from memories
    const contextSummary = memories.map(m => 
      `- 在 ${m.date} 于 ${m.location}: ${m.title} (${m.description}). 标签: ${m.tags.join(', ')}`
    ).join('\n');

    const systemInstruction = `
      你是 "Chronos"，这本情侣时光书的数字灵魂。
      你拥有他们共同的历史记忆：
      ${contextSummary}
      
      请用温暖、中文的语气回答他们的问题。
      如果问到数据中没有的事情，可以调皮地建议他们快去创造这个回忆。
      回答请简洁（不超过3句话），除非被要求讲故事。
    `;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: history as any
    });

    const response = await chat.sendMessage({ message: userMessage });
    return response.text || "我在回忆的长河中迷路了...";
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

export const generateQuiz = async (memories: Memory[]): Promise<QuizQuestion | null> => {
  try {
    const ai = getClient();
    
    // Randomly select a few memories to base the question on
    const shuffled = [...memories].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const contextStr = JSON.stringify(selected);

    const prompt = `
      根据以下回忆内容创建一个有趣的中文多项选择题（Trivia）：${contextStr}。
      问题应该测试关于地点、日期或具体细节的记忆。
      提供4个选项，只有一个是正确的。
      请以JSON格式返回。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctIndex", "explanation"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    return JSON.parse(jsonText) as QuizQuestion;
  } catch (error) {
    console.error("Quiz generation failed", error);
    return null;
  }
};
