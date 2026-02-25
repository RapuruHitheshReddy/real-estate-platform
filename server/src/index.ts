import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/authMiddleware";

/* ROUTE IMPORT */
import tenantRoutes from "./routes/tenantRoutes";
import managerRoutes from "./routes/managerRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import applicationRoutes from "./routes/applicationRoutes";

/* CONFIG */
dotenv.config();

const app = express();

/* SECURITY */
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

/* CORS */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

/* LOGGING */
app.use(morgan("common"));

/*
IMPORTANT:
Do NOT parse multipart here.
Multer will handle it inside routes.
*/
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("API is running");
});

/* ROUTES */
app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3002;

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
});