import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Valid status flow
const VALID_STATUSES = ["RECIBIDA", "DIAGNOSTICO", "EN_PROCESO", "LISTA", "ENTREGADA", "CANCELADA"];

const TRANSITIONS = {
  RECIBIDA:    ["DIAGNOSTICO", "CANCELADA"],
  DIAGNOSTICO: ["EN_PROCESO",  "CANCELADA"],
  EN_PROCESO:  ["LISTA",       "CANCELADA"],
  LISTA:       ["ENTREGADA",   "CANCELADA"],
  ENTREGADA:   [],
  CANCELADA:   [],
};

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bikeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "bikes",
        key: "id",
      },
      validate: {
        notNull: { msg: "La moto es requerida" },
        isInt: { msg: "El ID de moto debe ser un número entero" },
      },
    },
    entryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    faultDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "La descripción de la falla es requerida" },
      },
    },
    status: {
      type: DataTypes.ENUM(...VALID_STATUSES),
      allowNull: false,
      defaultValue: "RECIBIDA",
      validate: {
        isIn: {
          args: [VALID_STATUSES],
          msg: `El estado debe ser uno de: ${VALID_STATUSES.join(", ")}`,
        },
      },
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: "El total no puede ser negativo" },
      },
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);


// Static helpers
Order.VALID_STATUSES = VALID_STATUSES;
Order.TRANSITIONS = TRANSITIONS;

Order.isValidTransition = function (from, to) {
  return (TRANSITIONS[from] || []).includes(to);
};

Order.validateTransition = function (from, to) {
  if (from === to) {
    return { valid: false, message: `La orden ya se encuentra en estado "${from}"` };
  }
  if (!Order.isValidTransition(from, to)) {
    const allowed = TRANSITIONS[from] || [];
    if (allowed.length === 0) {
      return {
        valid: false,
        message: `Una orden en estado "${from}" no puede cambiar de estado`,
      };
    }
    return {
      valid: false,
      message: `Transición inválida de "${from}" a "${to}". Transiciones permitidas: ${allowed.join(", ")}`,
    };
  }
  return { valid: true };
};

export default Order;