import { Router } from "express";
import { TracksController } from "../controllers/trackController";

const router = Router();
const tracksController = new TracksController();

router.post("/", tracksController.createTrack);
router.get("/", tracksController.getTracks);
router.put("/:trackId", tracksController.updateTrack);
router.delete("/:trackId", tracksController.deleteTrack);

export default router;