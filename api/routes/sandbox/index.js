import express from "express";
import { requireSandbox } from "../../middleware/sandboxAuth.js";
import {
  startSession,
  getMe,
  list,
  getOne,
  create,
  update,
  remove,
  storesByParty,
} from "../../controllers/sandbox/index.js";

const router = express.Router();

// Public: begin a sandbox session (clones seed, returns 6h token).
router.post("/session/start", startSession);

// Everything below requires a valid (signature + DB-expiry) sandbox token.
router.get("/session/me", requireSandbox, getMe);
router.get("/storeByPartyId/:partyId", requireSandbox, storesByParty);

router.get("/:resource", requireSandbox, list);
router.post("/:resource", requireSandbox, create);
router.get("/:resource/:id", requireSandbox, getOne);
router.put("/:resource/:id", requireSandbox, update);
router.put("/:resource/:id/:action", requireSandbox, update);
router.delete("/:resource/:id", requireSandbox, remove);
router.delete("/:resource/:id/:action", requireSandbox, remove);

export default router;
