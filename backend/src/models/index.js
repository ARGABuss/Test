import sequelize from "../config/database.js";
import Client from "./client.js";
import Bike from "./bike.js";
import Order from "./order.js";
import Item from "./item.js";


Client.hasMany(Bike, { foreignKey: "clientId", as : "bikes",onDelete: "RESTRICT", onUpdate: "CASCADE" });
Bike.belongsTo(Client, { foreignKey: "clientId" , as : "client"});


// Bike 1:N Order
Bike.hasMany(Order, { foreignKey: "bikeId", as: "orders", onDelete: "RESTRICT" });
Order.belongsTo(Bike, { foreignKey: "bikeId", as: "bike" });

// Order 1:N Item
Order.hasMany(Item, { foreignKey: "work_order_id", as: "items", onDelete: "CASCADE" });
Item.belongsTo(Order, { foreignKey: "work_order_id", as: "order" });


export { sequelize, Client, Bike, Order, Item };
export default { sequelize, Client, Bike, Order, Item };
