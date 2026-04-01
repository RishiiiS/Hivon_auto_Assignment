import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;
// Initialize safely in case GEMINI_API_KEY is missing, allowing graceful failure later without crashing startup
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Generates a concise summary using Google Gemini AI.
 * Handles API errors gracefully by falling back to a truncated text.
 * 
 * @param {string} text - The main body text of the post
 * @returns {Promise<string>} - A ~200 word summary
 */
export async function generateSummary(text) {
  if (!text || text.trim().length === 0) {
    return "";
  }

  // Graceful fallback if API key is not configured
  if (!genAI) {
    console.warn("GEMINI_API_KEY is missing. Falling back to truncated summary.");
    return text.substring(0, 500) + (text.length > 500 ? "..." : "");
  }

  try {
    // gemini-1.5-flash is currently the standard fast model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Please provide a concise summary of the following text. Limit your response to approximately 200 words:\n\n${text}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
    
  } catch (error) {
    console.error("AI Summary generation failed:", error.message || error);
    // Graceful degradation: return a truncated version of the original text
    return text.substring(0, 500) + (text.length > 500 ? "..." : "");
  }
}
