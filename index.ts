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
import getTracksHandler from "./api/modules/tracks/get-tracks";
import updateTrackHandler from "./api/modules/tracks/update-track";
import deleteTrackHandler from "./api/modules/tracks/delete-track";

import createSessionHandler from "./api/modules/sessions/create-session";
import getSessionsHandler from "./api/modules/sessions/get-sessions";
import updateSessionHandler from "./api/modules/sessions/update-session";
import deleteSessionHandler from "./api/modules/sessions/delete-session";

import createStallHandler from "./api/modules/stalls/create-stall";
import getStallsHandler from "./api/modules/stalls/get-stalls";
import updateStallHandler from "./api/modules/stalls/update-stall";
import deleteStallHandler from "./api/modules/stalls/delete-stall";
import getStallDetailsHandler from "./api/modules/stalls/get-stall-details";
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

app.post("/api/v1/sessions", createSessionHandler);
app.get("/api/v1/sessions", getSessionsHandler);
app.put("/api/v1/sessions/:sessionId", updateSessionHandler);
app.delete("/api/v1/sessions/:sessionId", deleteSessionHandler);

app.post("/api/v1/stalls", createStallHandler);
app.get("/api/v1/stalls", getStallsHandler);
app.put("/api/v1/stalls/:eventId/:zoneId/:trackId/:stallId", updateStallHandler);
app.delete("/api/v1/stalls/:eventId/:zoneId/:trackId/:stallId", deleteStallHandler);
app.get("/api/v1/stalls/details", getStallDetailsHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});