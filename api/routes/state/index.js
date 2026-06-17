// import exress from "express";
// import {
//     createState,
//     deleteState,
//     getStateById,
//     getAllStates,
//     updateState,
// } from "../../controllers/state/index.js";
// import multer from "multer";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = exress.Router();

// router.get("/api/states", authenticateToken,getAllStates);
// router.get("/api/states/:id", authenticateToken,getStateById);
// router.post("/api/states", upload.none(), authenticateToken,createState);
// router.put("/api/states/:id", authenticateToken,updateState);
// router.delete("/api/states/:id", authenticateToken,deleteState);

// export default router;

import express from "express";
import {
    createState,
    softDeleteState,
    hardDeleteState,
    restoreState,
    getStateById,
    getAllStates,
    updateState,
    importStates,
} from "../../controllers/state/index.js";
import multer from "multer";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/states", authenticateToken, getAllStates);
router.get("/api/states/:id", authenticateToken, getStateById);
router.post("/api/states", upload.none(), authenticateToken, createState);
router.put("/api/states/:id", authenticateToken, updateState);

// Soft delete (toggle active status)
router.patch("/api/states/:id/soft-delete", authenticateToken, softDeleteState);

// Hard delete (permanent delete)
router.delete("/api/states/:id/hard-delete", authenticateToken, hardDeleteState);

// Restore soft deleted state
router.patch("/api/states/:id/restore", authenticateToken, restoreState);

router.post('/api/states/import', upload.none(), authenticateToken, importStates);

export default router;