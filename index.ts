import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import healthCheckHandler from "./api/healthCheck";
dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
}));
app.use(bodyParser.json());

app.options('*', cors());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/api/v1/auth/test-cors", (req, res) => {
  res.json({ 
    message: "CORS is working!", 
    timestamp: new Date().toISOString()
  });
});

app.get("/api/v1/health", healthCheckHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});