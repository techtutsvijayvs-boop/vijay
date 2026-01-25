
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ExtractedCalibrationData {
  certificateNumber: string;
  calibrationDate: string;
  nextDueDate: string;
  labName: string;
}

export const scanCalibrationCertificate = async (base64Data: string, mimeType: string): Promise<ExtractedCalibrationData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data.split(',')[1] || base64Data,
                mimeType: mimeType
              }
            },
            {
              text: "You are an equipment maintenance specialist. Extract the calibration details from this certificate. Focus on: Certificate Number, Calibration Date, Next Due Date (Expiry), and Lab Name. Return the result in pure JSON format."
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            certificateNumber: { type: Type.STRING },
            calibrationDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
            nextDueDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
            labName: { type: Type.STRING }
          },
          required: ["certificateNumber", "calibrationDate", "nextDueDate", "labName"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ExtractedCalibrationData;
  } catch (error) {
    console.error("AI Scanning Error:", error);
    return null;
  }
};
