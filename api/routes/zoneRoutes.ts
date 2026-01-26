import { Router } from "express";
import { ZonesController } from "../controllers/zoneController";

const router = Router();
const zonesController = new ZonesController();

router.post("/", zonesController.createZone);
router.get("/", zonesController.getZones);
router.put("/:zoneId", zonesController.updateZone);
router.delete("/:zoneId", zonesController.deleteZone);

export default router;