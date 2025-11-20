import { Sequelize } from "sequelize-typescript";
import { config } from "dotenv";
config();

import User from "./models/user.model.js"; 

const sequelize = new Sequelize({
  database: process.env.DB_NAME as string,
  username: process.env.DB_USERNAME as string,
  password: process.env.DB_PASSWORD as string,
  dialect: "mysql",
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT),
  models: [User], // ✅ register the model directly
});

sequelize
  .authenticate()
  .then(() => console.log("Authentication successful!"))
  .catch((err) => console.log("Something went wrong:", err));

sequelize.sync({ alter: false }).then(() => {
  console.log("Database synchronized successfully!");
})

export default sequelize;
