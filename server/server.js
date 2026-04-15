import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import producerRoutes from "./routes/producers.js";
import { sanitizeBodyStrings } from "./middleware/sanitize.js";

// Load environment variables
dotenv.config();

// Initialise Express app
const app = express();

// Middleware
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use(sanitizeBodyStrings);
app.use(
  helmet({
    // This project serves an API; CSP is typically enforced at the frontend.
    contentSecurityPolicy: false
  })
);

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: "draft-7",
        legacyHeaders: false
    })
);

// Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/producers", producerRoutes);

// Basic error handler (last middleware)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Using JSON file-based storage (users.json)");
});