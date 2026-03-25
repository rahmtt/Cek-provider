import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { sidompul } from "./sidompul.js";

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// Simple validation helper
function normalizeNumber(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  // allow digits only
  const digits = raw.replace(/[^\d]/g, "");
  return digits;
}

// API route
app.post("/api/check", async (req, res) => {
  try {
    const number = normalizeNumber(req.body?.number);

    if (!number) {
      return res.status(400).json({
        success: false,
        message: "Nomor tidak boleh kosong",
        results: null,
      });
    }

    if (number.length < 9 || number.length > 16) {
      return res.status(400).json({
        success: false,
        message: "Panjang nomor tidak valid",
        results: null,
      });
    }

    const result = await sidompul(number);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e?.message || "Internal server error",
      results: null,
    });
  }
});

// Fallback to index.html 
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Web running on http://localhost:${PORT}`);
}); 
