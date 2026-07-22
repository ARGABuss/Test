import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Client = sequelize.define(
  "Client",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre es requerido" },
        len: { args: [1, 255], msg: "El nombre no puede exceder 255 caracteres" },
      },
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El teléfono es requerido" },
        len: { args: [1, 50], msg: "El teléfono no puede exceder 50 caracteres" },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: { msg: "El email no tiene un formato válido" },
      },
    },
  },
  {
    tableName: "clients",
    timestamps: true,
  }
);

export default Client;
