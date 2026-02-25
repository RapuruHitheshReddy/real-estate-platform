import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
} from "../controllers/propertyControllers";
import { getPropertyLeases } from "../controllers/leaseControllers";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
  },
});

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);

router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos", 10), // limit to 10 images
  createProperty
);

router.get(
  "/:id/leases",
  authMiddleware(["manager", "tenant"]),
  getPropertyLeases
);

export default router;