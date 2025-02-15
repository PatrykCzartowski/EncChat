import express from "express";
import { createSession, getSessionId, deleteSession } from "../controllers/webSocketSessionController.js";

const router = express.Router();

router.post("/create", createSession);
router.get("/get", getSessionId);
router.delete("/delete", deleteSession);

export default router;