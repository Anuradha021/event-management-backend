import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import healthCheckHandler from "./api/utils/healthCheck";
import loginHandler from "./api/auth/login";
import signupHandler from "./api/auth/signup";
import meHandler from "./api/auth/me";
import getPublishedEventsHandler from "./api/modules/events/get-published-events";
import getTicketsHandler from "./api/modules/events/get-tickets";
import getAssignedEventsHandler from "./api/modules/events/get-assigned-events";
import checkApprovalHandler from "./api/modules/events/check-approval";
import getEventDetailsHandler from "./api/modules/events/get-event-details";
import publishEventHandler from "./api/modules/events/publish-event";

import createZoneHandler from "./api/modules/zones/create-zone";
import getZonesHandler from "./api/modules/zones/get-zone";
import deleteZoneHandler from "./api/modules/zones/delete-zone";
import updateZoneHandler from "./api/modules/zones/update-zone"; 

import createTrackHandler from "./api/modules/tracks/create-track";
import getTracksHandler from "./api/modules/tracks/get-tracks.ts";
import updateTrackHandler from "./api/modules/tracks/update-track";
import deleteTrackHandler from "./api/modules/tracks/delete-track";
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
app.get("/api/v1/tickets", getTicketsHandler);
app.get("/api/v1/organizer/get-assigned-events", getAssignedEventsHandler);
app.get("/api/v1/organizer/check-approval", checkApprovalHandler);
app.get("/api/v1/organizer/get-event-details", getEventDetailsHandler);
app.post("/api/v1/organizer/publish-event", publishEventHandler);

app.post("/api/v1/zones", createZoneHandler);
app.get("/api/v1/zones", getZonesHandler);
app.put("/api/v1/zones/:zoneId", updateZoneHandler); 
app.delete("/api/v1/zones/:zoneId", deleteZoneHandler);


app.post("/api/v1/tracks", createTrackHandler);
app.get("/api/v1/tracks", getTracksHandler);
app.put("/api/v1/tracks/:trackId", updateTrackHandler);
app.delete("/api/v1/tracks/:trackId", deleteTrackHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});