import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import healthCheckHandler from "./api/utils/healthCheck";


import authRoutes from "./api/routes/authRoutes";
import eventsRoutes from "./api/routes/eventsRoutes";
import organizerRoutes from "./api/routes/organizerRoutes";
import zonesRoutes from "./api/routes/zoneRoutes";
import tracksRoutes from "./api/routes/trackRoutes";
import sessionsRoutes from "./api/routes/sessionRoutes"; 
import stallsRoutes from "./api/routes/stallRoutes";
import ticketRoutes from "./api/routes/ticketRoutes";
import userRoutes from "./api/routes/userRoutes"; 


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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventsRoutes);
app.use("/api/v1/organizer", organizerRoutes);
app.use("/api/v1/zones", zonesRoutes);
app.use("/api/v1/tracks", tracksRoutes);
app.use("/api/v1/sessions", sessionsRoutes);
app.use("/api/v1", stallsRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/users", userRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});