
import { GoogleGenAI } from '@google/genai';

// The '__GEMINI_API_KEY__' placeholder will be replaced by the entrypoint.sh script
// in the Docker container with the actual environment variable. This is a workaround
// for client-side code that needs an API key at runtime without a server-side build step.
const apiKey = '__GEMINI_API_KEY__';

if (apiKey === '__GEMINI_API_KEY__') {
  // This will only be true if the replacement fails.
  // We log an error, but don't throw, to allow the app to run,
  // although Gemini features will fail.
  console.error("Gemini API Key was not replaced. Grabby features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

export async function generateTags(filename: string): Promise<string[]> {
  const prompt = `
    Analyze the following filename and generate a JSON array of 3-5 relevant, concise, lowercase tags. 
    The tags should categorize the file's likely content or purpose.
    For example, for 'Q3_Financial_Report_2024.docx', a good response would be ["finance", "report", "q3", "2024"].
    For 'Project_Bandit_Proposal_v2.pdf', a good response would be ["proposal", "project bandit", "internal"].
    
    Filename: "${filename}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
      return parsedData;
    } else {
      console.warn("Gemini response was not an array of strings:", parsedData);
      return [filename.split('.')[0].toLowerCase()]; // Fallback
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Provide a fallback in case of API error
    return [filename.split('.')[0].replace(/_/g, ' ').toLowerCase()];
  }
}
