import { Router } from "express";
import { StallsController } from "../controllers/stallController";

const router = Router();
const stallsController = new StallsController();

router.post(
    "/events/:eventId/zones/:zoneId/tracks/:trackId/stalls",
    stallsController.createStall
);

router.get(
    "/events/:eventId/zones/:zoneId/tracks/:trackId/stalls",
    stallsController.getStalls
);

router.get(
    "/events/:eventId/zones/:zoneId/tracks/:trackId/stalls/:stallId",
    stallsController.getStallDetails
);

router.put(
    "/events/:eventId/zones/:zoneId/tracks/:trackId/stalls/:stallId",
    stallsController.updateStall
);

router.delete(
    "/events/:eventId/zones/:zoneId/tracks/:trackId/stalls/:stallId",
    stallsController.deleteStall
);

export default router;