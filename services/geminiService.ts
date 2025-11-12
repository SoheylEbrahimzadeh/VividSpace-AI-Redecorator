import { GoogleGenAI, Modality } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select an API key.");
  }
  return new GoogleGenAI({ apiKey });
};

// Fix: Updated model name to 'gemini-2.5-flash-image' as per guidelines for image generation/editing.
const model = 'gemini-2.5-flash-image';

const generateImageFromParts = async (parts: any[]): Promise<string | null> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
      return firstPart.inlineData.data;
    }
    console.warn("Gemini response did not contain an image.", response);
    throw new Error('The AI did not return an image. Please try a different prompt.');
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    throw error;
  }
};

const base64ToPart = (base64Data: string, mimeType: string) => ({
  inlineData: {
    data: base64Data,
    mimeType,
  },
});

const getMimeType = (base64Data: string): string => {
  const mimeTypeMatch = base64Data.match(/^data:(.*);base64,/);
  if (mimeTypeMatch && mimeTypeMatch[1]) {
    return mimeTypeMatch[1];
  }
  console.warn("Could not determine MIME type from base64 string. Defaulting to image/jpeg.");
  return 'image/jpeg';
};

export const redecorateImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  const imageData = base64Image.split(',')[1];
  const mimeType = getMimeType(base64Image);
  
  const imagePart = base64ToPart(imageData, mimeType);
  const textPart = { text: prompt };

  return generateImageFromParts([imagePart, textPart]);
};

export const applyTextureToImage = async (base64RoomImage: string, base64TextureImage: string): Promise<string | null> => {
  const roomImageData = base64RoomImage.split(',')[1];
  const roomMimeType = getMimeType(base64RoomImage);
  const textureImageData = base64TextureImage.split(',')[1];
  const textureMimeType = getMimeType(base64TextureImage);

  const roomImagePart = base64ToPart(roomImageData, roomMimeType);
  const textureImagePart = base64ToPart(textureImageData, textureMimeType);
  const textPart = { text: "Using the first image as the room, apply the texture from the second image to the walls. Preserve the original lighting and perspective." };

  return generateImageFromParts([textPart, roomImagePart, textureImagePart]);
};

export const addItemToImage = async (base64RoomImage: string, base64ItemImage: string): Promise<string | null> => {
  const roomImageData = base64RoomImage.split(',')[1];
  const roomMimeType = getMimeType(base64RoomImage);
  const itemImageData = base64ItemImage.split(',')[1];
  const itemMimeType = getMimeType(base64ItemImage);

  const roomImagePart = base64ToPart(roomImageData, roomMimeType);
  const itemImagePart = base64ToPart(itemImageData, itemMimeType);
  const textPart = { text: "Using the first image as the room, seamlessly integrate the object from the second image into it. Match the style, lighting, and perspective of the room." };

  // Note the order: text, room, item. The prompt refers to them as "first" and "second".
  return generateImageFromParts([textPart, roomImagePart, itemImagePart]);
};