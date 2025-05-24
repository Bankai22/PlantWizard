// FIX: Replaced GenerateContentCandidate with Candidate as it's not an exported member.
import { GoogleGenAI, GenerateContentResponse, Candidate, GroundingChunk as GenAIGroundingChunk } from "@google/genai";
import { GEMINI_TEXT_MODEL, PLANT_INFO_PROMPT_TEMPLATE, PLANT_IDENTIFICATION_PROMPT, PLANT_HEALTH_PROMPT_TEMPLATE } from '../constants';
import { PlantDetails, GroundingChunk, PlantHealthDetails } from '../types';

// Ensure VITE_API_KEY is available.
const apiKey = process.env.VITE_API_KEY;
if (!apiKey) {
  console.error("VITE_API_KEY environment variable is not set. Please set it to use the Gemini API.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" }); 

const mapGroundingChunks = (apiChunks: GenAIGroundingChunk[] | undefined): GroundingChunk[] | null => {
    if (!apiChunks || apiChunks.length === 0) {
        return null;
    }
    return apiChunks.map(chunk => ({
        web: chunk.web ? { uri: chunk.web.uri || "", title: chunk.web.title || "Untitled Source" } : undefined,
    })).filter(chunk => chunk.web && chunk.web.uri); 
};


export const getPlantInfo = async (plantName: string): Promise<{details: PlantDetails | null, attributions: GroundingChunk[] | null, error?: string}> => {
  if (!apiKey) return { details: null, attributions: null, error: "API Key not configured." };
  try {
    const prompt = PLANT_INFO_PROMPT_TEMPLATE(plantName);
    // FIX: Removed responseMimeType: "application/json" as it's not supported with googleSearch tool.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    let jsonStr = response.text?.trim();
    if (!jsonStr) {
      return { details: null, attributions: null, error: "No response received from Gemini API." };
    }
    
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    // FIX: Changed type GenerateContentCandidate to Candidate to match the corrected import.
    const candidate: Candidate | undefined = response.candidates?.[0];
    const attributions = mapGroundingChunks(candidate?.groundingMetadata?.groundingChunks);

    try {
      const parsedData: PlantDetails = JSON.parse(jsonStr);
      return { details: parsedData, attributions };
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini:", e, "Raw text:", response.text);
      if (response.text?.includes("isFictionalOrNotFound")) {
         return { details: { commonName: plantName, scientificName: 'N/A', description: 'Could not retrieve structured data.', careInstructions: {sunlight: 'N/A', water: 'N/A', soil: 'N/A'}, isFictionalOrNotFound: true, message: 'Failed to parse detailed plant information. The plant might be obscure or the data format was unexpected.' }, attributions };
      }
      return { details: null, attributions, error: `Failed to parse plant information. Gemini raw response: ${response.text || 'No response'}` };
    }
  } catch (error) {
    console.error("Error fetching plant information:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching plant information.";
    return { details: null, attributions: null, error: errorMessage };
  }
};

export const identifyPlantFromImage = async (base64ImageDataWithPrefix: string): Promise<{ plantName: string | null, error?: string }> => {
  if (!apiKey) return { plantName: null, error: "API Key not configured." };
  try {
    // Extract pure base64 data if a data URL prefix is present
    const base64Data = base64ImageDataWithPrefix.startsWith('data:') 
      ? base64ImageDataWithPrefix.split(',')[1] 
      : base64ImageDataWithPrefix;

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg', // Assuming JPEG, adjust if handling various types
        data: base64Data,
      },
    };
    const textPart = { text: PLANT_IDENTIFICATION_PROMPT };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL, // Use a model that supports multimodal input
      contents: { parts: [imagePart, textPart] },
      config: {
        // thinkingConfig: { thinkingBudget: 0 } // Potentially for faster response
      }
    });

    const identifiedName = response.text?.trim();
    if (identifiedName && identifiedName.toLowerCase() !== "unknown") {
      return { plantName: identifiedName };
    } else if (identifiedName?.toLowerCase() === "unknown") {
      return { plantName: null, error: "Could not identify the plant. The model was unsure." };
    } else {
      return { plantName: null, error: "Identification response was unclear or empty." };
    }

  } catch (error) {
    console.error("Error identifying plant from image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during plant identification.";
    return { plantName: null, error: errorMessage };
  }
};

export const analyzePlantHealth = async (base64ImageDataWithPrefix: string, plantName: string): Promise<{ healthDetails: PlantHealthDetails | null, error?: string }> => {
  if (!apiKey) return { healthDetails: null, error: "API Key not configured." };
  try {
    // Extract pure base64 data if a data URL prefix is present
    const base64Data = base64ImageDataWithPrefix.startsWith('data:') 
      ? base64ImageDataWithPrefix.split(',')[1] 
      : base64ImageDataWithPrefix;

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg', // Assuming JPEG, adjust if handling various types
        data: base64Data,
      },
    };
    const textPart = { text: PLANT_HEALTH_PROMPT_TEMPLATE(plantName) };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL, // Use a model that supports multimodal input
      contents: { parts: [imagePart, textPart] },
      config: {
        // thinkingConfig: { thinkingBudget: 0 } // Potentially for faster response
      }
    });

    let jsonStr = response.text?.trim();
    if (!jsonStr) {
      return { healthDetails: null, error: "No response received from health analysis." };
    }

    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    try {
      const parsedData: PlantHealthDetails = JSON.parse(jsonStr);
      return { healthDetails: parsedData };
    } catch (e) {
      console.error("Failed to parse JSON response from health analysis:", e, "Raw text:", response.text);
      return { healthDetails: null, error: `Failed to parse health analysis. Raw response: ${response.text}` };
    }
  } catch (error) {
    console.error("Error analyzing plant health:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during plant health analysis.";
    return { healthDetails: null, error: errorMessage };
  }
};