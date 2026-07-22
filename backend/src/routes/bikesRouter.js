import express from "express";
import { body, validationResult, param, query } from "express-validator";
import { Bike, Client  } from "../models/index.js";
import { Op } from "sequelize";

const router = express.Router();



const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: "Datos inválidos", details: errors.array() });
  }
  next();
};

// ── POST /api/bikes
router.post("/",
  [
    body("placa")
      .trim()
      .notEmpty()
      .withMessage("La placa es requerida")
      .isLength({ max: 20 })
      .withMessage("La placa no puede exceder 20 caracteres"),
    body("brand")
      .trim()
      .notEmpty()
      .withMessage("La marca es requerida")
      .isLength({ max: 100 }),
    body("model")
      .trim()
      .notEmpty()
      .withMessage("El modelo es requerido")
      .isLength({ max: 100 }),
    body("cylinder")
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 })
      .withMessage("El cilindraje debe ser un entero mayor a 0"),
    body("clientId")
      .isInt({ min: 1 })
      .withMessage("El ID de cliente debe ser un entero positivo"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { placa, brand, model, cylinder, clientId } = req.body;
      const placaUpper = placa.toUpperCase().trim();

      // Validate client exists
      console.log("Client found:", clientId); // Debugging line
      const client = await Client.findByPk(clientId);
      if (!client) {
        return res.status(404).json({ success: false, error: "Cliente no encontrado" });
      }

      // Check unique plate
      const existing = await Bike.findOne({ where: { placa: placaUpper } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: "Ya existe una moto registrada con esa placa",
        });
      }

      const bike = await Bike.create({
        placa: placaUpper,
        brand: brand.trim(),
        model: model.trim(),
        cylinder: cylinder || null,
        clientId: clientId,
      });

      return res.status(201).json({ success: true, data: bike });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/bikes?plate=
router.get("/",[query("plate").optional().isString()],validate, async (req, res, next) => {
    try {
      const plate = req.query.plate || "";
      const where = plate ? { placa: { [Op.iLike]: `%${plate}%` } } : {};

      const bikes = await Bike.findAll({
        where,
        include: [{ model: Client, as: "client", attributes: ["id", "name", "phone", "email"] }],
        order: [["placa", "ASC"]],
      });

      return res.json({ success: true, data: bikes });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/bikes/:id 
router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  validate,
  async (req, res, next) => {
    try {
      const bike = await Bike.findByPk(req.params.id, {
        include: [{ model: Client, as: "client", attributes: ["id", "name", "phone", "email"] }],
      });
      if (!bike) {
        return res.status(404).json({ success: false, error: "Moto no encontrada" });
      }
      return res.json({ success: true, data: bike });
    } catch (err) {
      next(err);
    }
  }
);

export default router;