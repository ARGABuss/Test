import express from "express";
import clientsRouter from "./routes/clientsRouter.js";
import bikesRouter from "./routes/bikesRouter.js";

const app = express();
app.use(express.json());
app.use("/api/clients", clientsRouter);
app.use("/api/bikes", bikesRouter);
app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok" });
});

export default app;