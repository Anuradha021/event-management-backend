import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import healthCheckHandler from "./api/healthCheck";
import loginHandler from "./api/auth/login";
import signupHandler from "./api/auth/signup";
import meHandler from "./api/auth/me";
import getPublishedEventsHandler from "./api/modules/get-published-events";
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
app.post("/api/v1/auth/login", loginHandler);
app.post("/api/v1/auth/signup", signupHandler);
app.get("/api/v1/auth/me", meHandler);
app.get("/api/v1/events/get-published-events", getPublishedEventsHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});