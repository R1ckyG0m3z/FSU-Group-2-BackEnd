import morgan from "morgan";
import express from "express";
import cors from "cors";

// routes
import adminRoutes from "./routes/admin.js";
import departmentRoutes from "./routes/departments.js";
import facultyRoutes from "./routes/faculty.js";

const app = express();
export default app;

// middleware
app.use(cors({ origin: /localhost/ }));
app.use(express.json());
app.use(morgan("dev"));

// health / test
app.get("/", (req, res) => {
  res.send("Hello Lincoln!");
});

// route mounting
app.use("/api/admin", adminRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/faculty", facultyRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Server error",
  });
});
