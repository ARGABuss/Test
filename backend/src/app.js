import express from "express"
import cors from "cors"
import clientsRouter from "./routes/clientsRouter.js"
import bikesRouter from "./routes/bikesRouter.js"
import workOrdersRouter from "./routes/workOrdersRouter.js"

const app = express()
app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())
app.use("/api/clients", clientsRouter)
app.use("/api/bikes", bikesRouter)
app.use("/api/work-orders", workOrdersRouter)
app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok" })
})

export default app
