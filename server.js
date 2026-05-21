import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

// In ES modules, __dirname is not defined by default, so we define it:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Set payload limit to 50MB because base64 image data can be large
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Check if Gemini API key exists
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("WARNING: GEMINI_API_KEY environment variable is not defined!");
}

// Initialize GoogleGenAI client (runs safely on server side)
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// --- BASIC RATE LIMITING MIDDLEWARE ---
const rateLimits = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10;     // Max 10 requests per minute per IP

function basicRateLimiter(req, res, next) {
  // Get client IP address
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  let record = rateLimits.get(ip);

  if (!record) {
    record = { count: 1, resetTime: now + WINDOW_MS };
    rateLimits.set(ip, record);
    return next();
  }

  // If window has expired, reset count and window time
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
    return next();
  }

  // Increment count
  record.count++;
  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Terlalu banyak permintaan (Too many requests). Silakan coba lagi dalam 1 menit.'
    });
  }

  next();
}

// Apply rate limiting specifically to all Gemini API endpoints
app.use('/api/', basicRateLimiter);

// --- GEMINI PROMPT CONSTANT ---
const CATEGORY_PROMPT = `The recommendations MUST be grouped by the following exactly 5 categories:
1. "Kuliah" (Available: Bella Square Basic, Paris Simple Style, Pashmina Lilit Simple, Rawis Casual Style, Korean Simple Hijab)
2. "Formal" (Available: Turkish Hijab Style, Bella Square Formal, Pashmina Inner Neck, Voal Elegant Style, Luxury Satin Hijab Style)
3. "Jalan-jalan" (Available: Korean Hijab Style, Pashmina Crinkle Style, Cewek Bumi Hijab Style, Loose Pashmina Style, Layer Hijab Style)
4. "Olahraga" (Available: Sport Hijab Instan, Bergo Sport Style, Inner Ninja Sport Hijab, Hijab Running Fit, Pashmina Jersey Simple)
5. "Acara" (Available: Pashmina Satin Glam, Layer Party Hijab, Turban Modern Style, Elegant Voal Style, Mutiara Hijab Style)

For each category, recommend exactly 3 styles from its "Available" list that best suit the user's analyzed face shape and facial proportions based on professional beauty and styling theories. 
Important: For all descriptions and names that require multiple languages, you MUST provide BOTH English (en) and Indonesian (id) translations. The 'description' should briefly explain WHY this style suits their specific face shape in 1 short sentence (max 15 words) in both languages.`;

// --- API ENDPOINT: RECOMMEND HIJAB (IMAGE ANALYSIS) ---
app.post('/api/recommend-hijab', async (req, res) => {
  const { base64Image, mimeType } = req.body;

  if (!base64Image || !mimeType) {
    return res.status(400).json({ error: 'Image data and mime type are required.' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
  }

  try {
    const systemInstruction = "You are a luxury AI hijab fashion stylist. Analyze the user's face shape and skin tone. Recommend top 3 hijab styles and color palettes that suit them. You MUST provide all descriptive text in BOTH English ('en') and Indonesian ('id').\n\n" + CATEGORY_PROMPT;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Reverted back to the previous AI model version as requested
      contents: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: `Analyze the portrait and provide hijab styling recommendations with descriptions in both English and Indonesian.` }
      ],
      config: {
        temperature: 0,
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            faceShapes: {
              type: Type.ARRAY,
              description: "An array of 1 or 2 face shapes that match the user, with their estimated percentage of match. Total must be 100.",
              items: {
                type: Type.OBJECT,
                properties: {
                  shape: { type: Type.STRING },
                  percentage: { type: Type.INTEGER, description: "Percentage value from 0 to 100 representing the likeness of this face shape." }
                },
                required: ["shape", "percentage"]
              }
            },
            faceShapeDescription: { 
              type: Type.OBJECT,
              properties: {
                en: { type: Type.STRING },
                id: { type: Type.STRING }
              },
              required: ["en", "id"],
              description: "A brief explanation of their face shape and its characteristics." 
            },
            skinTone: { 
              type: Type.OBJECT,
              properties: {
                en: { type: Type.STRING, description: "e.g., Warm Olive, Cool Fair" },
                id: { type: Type.STRING, description: "e.g., Zaitun Hangat, Terang Dingin" }
              },
              required: ["en", "id"]
            },
            recommendationsByCategory: {
              type: Type.ARRAY,
              description: "Top 3 recommended hijab styles strictly filtered by the 5 categories.",
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  styles: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { 
                          type: Type.OBJECT,
                          properties: {
                            en: { type: Type.STRING },
                            id: { type: Type.STRING }
                          },
                          required: ["en", "id"]
                        }
                      },
                      required: ["name", "description"]
                    }
                  }
                },
                required: ["category", "styles"]
              }
            },
            recommendedPalettes: {
              type: Type.ARRAY,
              description: "Recommended color palettes for their skin tone.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.OBJECT,
                    properties: {
                      en: { type: Type.STRING },
                      id: { type: Type.STRING }
                    },
                    required: ["en", "id"]
                  },
                  colors: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Minimum 3 valid hex color codes per palette" 
                  }
                },
                required: ["name", "colors"]
              }
            }
          },
          required: ["faceShapes", "faceShapeDescription", "skinTone", "recommendationsByCategory", "recommendedPalettes"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No text response received from Gemini API");
    }

    const parsedResult = JSON.parse(response.text);
    return res.json(parsedResult);
  } catch (error) {
    console.error("Gemini face analysis API error:", error);
    return res.status(500).json({ error: error.message || 'Gagal menganalisis wajah.' });
  }
});

// --- API ENDPOINT: GENERATE HIJAB PREVIEW ---
app.post('/api/generate-preview', async (req, res) => {
  const { base64Image, mimeType, style, colorHex, paletteName, isColorOnlyUpdate } = req.body;

  if (!base64Image || !mimeType) {
    return res.status(400).json({ error: 'Image data and mime type are required.' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
  }

  try {
    let styleInstruction = style ? `styled as "${style}"` : "styled elegantly";
    let colorInstruction = colorHex ? `The color of the hijab MUST exactly match the hex color code ${colorHex}${paletteName ? ` (from the ${paletteName} palette)` : ''}.` : "The color of the hijab should complement their skin tone naturally.";

    let prompt = `Edit this portrait: The person is wearing a hijab ${styleInstruction}. The length, coverage, and draping structure MUST strictly match the requested style, ignoring the shape or length of any previous hair or hijab in the original image. ${colorInstruction} Maintain the original face identity, facial expression, lighting, camera angle, and original background. Ensure the hijab looks realistic, highly detailed, elegant, and perfectly draped.`;

    if (isColorOnlyUpdate) {
      prompt = `Edit this portrait to ONLY change the color of the existing hijab. ${colorInstruction} The exact draping, folds, fabric structure, face, expression, lighting, and background MUST remain perfectly identical to the input image. You are exclusively modifying the hue and color of the fabric.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: prompt },
      ]
    });

    let imageBase64 = null;
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        imageBase64 = "data:" + (part.inlineData.mimeType || 'image/png') + ";base64," + part.inlineData.data;
        break;
      }
    }

    if (!imageBase64) {
      throw new Error("No image data returned in Gemini response parts");
    }

    return res.json({ image: imageBase64 });
  } catch (error) {
    console.error("Gemini image generation API error:", error);
    return res.status(500).json({ error: error.message || 'Gagal menghasilkan preview hijab.' });
  }
});

// --- SERVE STATIC FRONTEND IN PRODUCTION ---
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  console.log(`Serving static files from: ${distPath}`);
  
  app.use(express.static(distPath));
  
  // SPA fallback: redirect all unhandled requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Simple healthcheck / dev status page
  app.get('/', (req, res) => {
    res.send('Hijabify AI Backend Server is running in development mode.');
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Hijabify AI Server is running on port ${PORT}`);
  console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`==================================================`);
});
