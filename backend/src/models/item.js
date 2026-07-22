import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ITEM_TYPES = ["MANO_OBRA", "REPUESTO"];

const Item = sequelize.define(
  "Item",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    work_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
      validate: {
        notNull: { msg: "La orden de trabajo es requerida" },
        isInt: { msg: "El ID de orden debe ser un número entero" },
      },
    },
    type: {
      type: DataTypes.ENUM(...ITEM_TYPES),
      allowNull: false,
      validate: {
        isIn: {
          args: [ITEM_TYPES],
          msg: `El tipo debe ser uno de: ${ITEM_TYPES.join(", ")}`,
        },
      },
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: { msg: "La descripción es requerida" },
        len: { args: [1, 500], msg: "La descripción no puede exceder 500 caracteres" },
      },
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "La cantidad debe ser un número entero" },
        min: { args: [1], msg: "La cantidad debe ser mayor a 0" },
      },
    },
    unitValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "El valor unitario debe ser un número válido" },
        min: { args: [0], msg: "El valor unitario debe ser mayor o igual a 0" },
      },
    },
  },
  {
    tableName: "items",
    timestamps: true,
    updatedAt: false,
  }
);

Item.ITEM_TYPES = ITEM_TYPES;

export default Item;