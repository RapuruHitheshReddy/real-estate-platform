import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
} from "../controllers/propertyControllers";
import { getPropertyLeases } from "../controllers/leaseControllers";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";

/* ---------------- MULTER CONFIG ---------------- */

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
  },
  fileFilter: (req, file, cb) => {
    console.log("Incoming file:", {
      name: file.originalname,
      type: file.mimetype,
    });

    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      console.error("Rejected file (not image):", file.originalname);
      cb(new Error("Only image uploads are allowed"));
    }
  },
});

/* ---------------- ROUTER ---------------- */

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);

/* ---------------- DEBUG MIDDLEWARE ---------------- */

const debugUpload = (req: any, res: any, next: any) => {
  console.log("---- PROPERTY UPLOAD DEBUG ----");

  const files = req.files || [];

  console.log("Files received:", files.length);

  files.forEach((file: any, index: number) => {
    console.log(`File ${index + 1}`, {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
      bufferLength: file.buffer?.length,
    });

    /* Detect corrupted uploads */
    if (!file.buffer || file.buffer.length === 0) {
      console.error("❌ Corrupted file detected:", file.originalname);
      return res.status(400).json({
        message: "Corrupted image upload detected",
      });
    }

    /* Log first bytes to confirm real image */
    const firstBytes = file.buffer.subarray(0, 8).toString("hex");
    console.log("First bytes:", firstBytes);

    /*
      JPEG starts with: ffd8
      PNG starts with: 89504e47
      WEBP starts with: 52494646
    */
  });

  next();
};

/* ---------------- CREATE PROPERTY ---------------- */

router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos", 10),
  debugUpload,
  createProperty
);

/* ---------------- LEASES ---------------- */

router.get(
  "/:id/leases",
  authMiddleware(["manager", "tenant"]),
  getPropertyLeases
);

export default router;