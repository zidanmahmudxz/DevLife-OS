import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing VITE_GEMINI_API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey });

export const generateProjectRoadmap = async (projectName: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `As a senior technical architect, create a structured project roadmap for: "${projectName}". 
      Description: ${description}. 
      Return a list of 5 key milestones with sub-tasks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              milestone: { type: Type.STRING },
              tasks: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["milestone", "tasks"]
          }
        }
      }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getFinancialAdvice = async (income: number, expenses: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `I am a freelance developer in Bangladesh. This month I earned ৳${income} and spent ৳${expenses}. 
      Give me 3 short, punchy pieces of advice for my financial health in the context of the local economy.`,
    });

    return response.text || "আপনার খরচ নিয়ন্ত্রণ করুন এবং সেভিংস বাড়ান।";
  } catch (error) {
    return "আপনার খরচ নিয়ন্ত্রণ করুন এবং সেভিংস বাড়ান।";
  }
};
