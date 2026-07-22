import express from "express";
import { body, param, query, validationResult } from "express-validator";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { Order, Bike, Client, Item } from "../models/index.js";

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Datos inválidos",
      details: errors.array().map((e) => e.msg),
    });
  }
  next();
}

// Shared include for order list/detail
const orderIncludes = [
  {
    model: Bike,
    as: "bike",
    attributes: ["id", "placa", "brand", "model", "cylinder"],
    include: [
      {
        model: Client,
        as: "client",
        attributes: ["id", "name", "phone", "email"],
      },
    ],
  },
];

// ── POST /api/work-orders
router.post(
  "/",
  [
    body("BikeId")
      .isInt({ min: 1 })
      .withMessage("El ID de moto es requerido y debe ser un entero positivo"),
    body("faultDescription")
      .trim()
      .notEmpty()
      .withMessage("La descripción de la falla es requerida"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { BikeId, faultDescription } = req.body;

      const bike = await Bike.findByPk(BikeId);
      if (!bike) {
        return res.status(404).json({
          success: false,
          error: "Moto no encontrada. Verifique el ID de la moto",
        });
      }

      const order = await Order.create({
        bikeId: BikeId,
        faultDescription: faultDescription.trim(),
        status: "RECIBIDA",
        total: 0,
      });

      return res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/work-orders?status=&plate=&page=&pageSize= 
router.get(
  "/",
  [
    query("status").optional().isString(),
    query("plate").optional().isString(),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("pageSize").optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const page     = parseInt(req.query.page || "1");
      const pageSize = parseInt(req.query.pageSize || "10");
      const status   = req.query.status || "";
      const plate    = req.query.plate  || "";

      // Build where clauses
      const orderWhere = {};
      if (status && Order.VALID_STATUSES.includes(status)) {
        orderWhere.status = status;
      }

      const bikeWhere = {};
      if (plate) {
        bikeWhere.placa = { [Op.iLike]: `%${plate}%` };
      }

      const includesWithFilter = [
        {
          model: Bike,
          as: "bike",
          where: Object.keys(bikeWhere).length ? bikeWhere : undefined,
          required: Object.keys(bikeWhere).length > 0,
          attributes: ["id", "placa", "brand", "model", "cylinder"],
          include: [
            {
              model: Client,
              as: "client",
              attributes: ["id", "name", "phone", "email"],
            },
          ],
        },
      ];

      const { count, rows } = await Order.findAndCountAll({
        where: orderWhere,
        include: includesWithFilter,
        order: [["entryDate", "DESC"]],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        distinct: true,
      });

      const totalPages = Math.ceil(count / pageSize);

      return res.json({
        success: true,
        data: {
          data: rows,
          total: count,
          page,
          pageSize,
          totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/work-orders/:id 
router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  validate,
  async (req, res, next) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [
          ...orderIncludes,
          { model: Item, as: "items", order: [["createdAt", "ASC"]] },
        ],
      });
      if (!order) {
        return res.status(404).json({ success: false, error: "Orden de trabajo no encontrada" });
      }
      return res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/work-orders/:id/status 
router.patch(
  "/:id/status",
  [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
    body("status")
      .notEmpty()
      .withMessage("El estado es requerido")
      .isIn(Order.VALID_STATUSES)
      .withMessage(`El estado debe ser uno de: ${Order.VALID_STATUSES.join(", ")}`),
  ],
  validate,
  async (req, res, next) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, error: "Orden de trabajo no encontrada" });
      }

      const { status: newStatus } = req.body;
      const validation = Order.validateTransition(order.status, newStatus);
      if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.message });
      }

      await order.update({ status: newStatus });
      return res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/work-orders/:id/items
router.post(
  "/:id/items",
  [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
    body("type")
      .notEmpty()
      .withMessage("El tipo es requerido")
      .isIn(["MANO_OBRA", "REPUESTO"])
      .withMessage("El tipo debe ser MANO_OBRA o REPUESTO"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("La descripción es requerida")
      .isLength({ max: 500 }),
    body("count")
      .isInt({ min: 1 })
      .withMessage("La cantidad debe ser un entero mayor a 0"),
    body("unitValue")
      .isFloat({ min: 0 })
      .withMessage("El valor unitario debe ser mayor o igual a 0"),
  ],
  validate,
  async (req, res, next) => {
    // Use a transaction to ensure total is consistent
    const t = await sequelize.transaction();
    try {
      const order = await Order.findByPk(req.params.id, { transaction: t });
      if (!order) {
        await t.rollback();
        return res.status(404).json({ success: false, error: "Orden de trabajo no encontrada" });
      }
      if (order.status === "ENTREGADA" || order.status === "CANCELADA") {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: `No se pueden agregar ítems a una orden en estado "${order.status}"`,
        });
      }

      const { type, description, count, unitValue } = req.body;
      const item = await Item.create(
        {
          work_order_id: order.id,
          type,
          description: description.trim(),
          count: parseInt(count),
          unitValue: parseFloat(unitValue),
        },
        { transaction: t }
      );

      // Recalculate total
      const items = await Item.findAll({
        where: { work_order_id: order.id },
        transaction: t,
      });
      const newTotal = items.reduce(
        (acc, i) => acc + parseFloat(i.unitValue) * i.count,
        0
      );
      await order.update({ total: newTotal }, { transaction: t });

      await t.commit();
      return res.status(201).json({
        success: true,
        data: { item, total: newTotal },
      });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
);

// ── DELETE /api/work-orders/items/:itemId
router.delete(
  "/items/:itemId",
  [param("itemId").isInt({ min: 1 }).withMessage("ID de ítem inválido")],
  validate,
  async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
      const item = await Item.findByPk(req.params.itemId, { transaction: t });
      if (!item) {
        await t.rollback();
        return res.status(404).json({ success: false, error: "Ítem no encontrado" });
      }

      const order = await Order.findByPk(item.work_order_id, { transaction: t });
      if (!order) {
        await t.rollback();
        return res.status(404).json({ success: false, error: "Orden no encontrada" });
      }
      if (order.status === "ENTREGADA" || order.status === "CANCELADA") {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: `No se pueden eliminar ítems de una orden en estado "${order.status}"`,
        });
      }

      await item.destroy({ transaction: t });

      // Recalculate total
      const items = await Item.findAll({
        where: { work_order_id: order.id },
        transaction: t,
      });
      const newTotal = items.reduce(
        (acc, i) => acc + parseFloat(i.unitValue) * i.count,
        0
      );
      await order.update({ total: newTotal }, { transaction: t });

      await t.commit();
      return res.json({ success: true, data: { deleted: true, total: newTotal } });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
);

export default router;
