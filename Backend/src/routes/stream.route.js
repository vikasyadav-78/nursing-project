import { Router } from "express";
import { addStream, getAllStreams, removeStream } from "../controller/stream.controller.js";

const router = Router();

router.post("/", addStream);
router.get("/", getAllStreams);
router.delete("/:id", removeStream);

export default router;
