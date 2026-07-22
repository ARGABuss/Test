import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Bike = sequelize.define(
  "Bike",
   {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    placa: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: {
        name: "motos_placa_unique",
        msg: "Ya existe una moto registrada con esa placa",
      },
      validate: {
        notEmpty: { msg: "La placa es requerida" },
        len: { args: [1, 20], msg: "La placa no puede exceder 20 caracteres" },
      },
      set(value) {
        this.setDataValue("placa", value ? value.toString().toUpperCase().trim() : value);
      },
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "La marca es requerida" },
        len: { args: [1, 100], msg: "La marca no puede exceder 100 caracteres" },
      },
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El modelo es requerido" },
        len: { args: [1, 100], msg: "El modelo no puede exceder 100 caracteres" },
      },
    },
    cylinder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "El cilindraje debe ser un número entero" },
        min: { args: [1], msg: "El cilindraje debe ser mayor a 0" },
      },
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      validate: {
        notNull: { msg: "El cliente es requerido" },
        isInt: { msg: "El ID de cliente debe ser un número entero" },
      },
    },
  },
  {
    tableName: "bikes",
    timestamps: true,
  }
);

export default Bike;
