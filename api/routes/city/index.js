// import express from "express";
// import { createCity, deleteCity, getCityById, getAllCities, updateCity } from "../../controllers/city/index.js";
// import multer from "multer";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/cities", authenticateToken,getAllCities);
// router.get("/api/cities/:id", authenticateToken,getCityById);
// router.post("/api/cities", upload.none(), authenticateToken,createCity);
// router.put("/api/cities/:id", authenticateToken,updateCity);
// router.delete("/api/cities/:id", authenticateToken,deleteCity);

// export default router;

import express from "express";
import { 
  createCity, 
  softDeleteCity, 
  hardDeleteCity, 
  restoreCity,
  getCityById, 
  getAllCities, 
  updateCity, 
  importCities
} from "../../controllers/city/index.js";
import multer from "multer";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/cities", authenticateToken, getAllCities);
router.get("/api/cities/:id", authenticateToken, getCityById);
router.post("/api/cities", upload.none(), authenticateToken, createCity);
router.put("/api/cities/:id", authenticateToken, updateCity);

// Soft delete (toggle active status)
router.patch("/api/cities/:id/soft-delete", authenticateToken, softDeleteCity);

// Hard delete (permanent delete)
router.delete("/api/cities/:id/hard-delete", authenticateToken, hardDeleteCity);

// Restore soft deleted city
router.patch("/api/cities/:id/restore", authenticateToken, restoreCity);

// routes file mein
router.post('/api/cities/import', upload.none(), authenticateToken, importCities);

export default router;