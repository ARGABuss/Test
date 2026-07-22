import express from "express";
import { body, validationResult } from "express-validator";
import { Client } from "../models/index.js";

const router = express.Router();



const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: "Datos inválidos", details: errors.array() });
  }
  next();
};

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("El nombre es requerido").isLength({ max: 255 }),
    body("phone").trim().notEmpty().withMessage("El teléfono es requerido").isLength({ max: 50 }),
    body("email").optional({ nullable: true, checkFalsy: true }).isEmail().withMessage("Email inválido").isLength({ max: 255 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, phone, email } = req.body;
      const client = await Client.create({ name, phone, email: email || null });
      res.status(201).json({ success: true, data: client });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const clients = await Client.findAll();
    res.json({ success: true, data: clients });
  } catch (err) {
    next(err);
  }
});

export default router;