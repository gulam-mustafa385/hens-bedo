import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Server-side Gemini API proxy route
  app.post("/api/ai-insights", async (req, res) => {
    try {
      const { prompt, userContext } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({
          reply: `[Hens Bedo AI Advice] Hello ${userContext?.username || 'Investor'}! Based on your current balance of Rs ${userContext?.balance?.toLocaleString() || '14,850'}, enrolling in Plan 02 (Growth Tier) or Plan 03 (Premium Growth) gives a steady daily ROI with 77-day compound distribution.`,
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are Hens Bedo AI, an executive financial advisor for Hens Bedo (a premium fintech yield platform). Give concise, encouraging, professional investment allocation advice for users. User context: ${JSON.stringify(
        userContext
      )}. Keep responses under 4 sentences with clear numbers.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text || "Hens Bedo AI strategy analysis complete.";
      return res.json({ reply });
    } catch (error) {
      console.error("AI Insights API Error:", error);
      return res.json({
        reply: `Hens Bedo AI Strategy Note: Allocating capital into 77-day compound plans yields predictable daily returns while earning up to 18% Tier-1 referral bonuses!`,
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", name: "Hens Bedo Platform" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
