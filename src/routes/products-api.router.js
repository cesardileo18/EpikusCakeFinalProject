import express from "express";
export const productsApiRouter = express.Router();
import { productsController } from "../controllers/products.controller.js";
import { checkAdmin } from "../middlewares/main.js";

productsApiRouter.post("/", checkAdmin, productsController.create); /* <---- CREAR UN UNEVO PRODUCTO */
productsApiRouter.get("/paginate", productsController.readWithPagination); /* <---- LEER LOS PRODUCTOS CON PAGINACION */
productsApiRouter.get("/", productsController.read); /* <---- LEER TODOS LOS PRODUCTOS */
productsApiRouter.get("/:_id", productsController.readById); /* <---- LEER UN PRODUCTO POR ID*/
productsApiRouter.put("/:_id", checkAdmin, productsController.update); /* <---- ACTUALIZAR UN PRODUCTO POR ID */
productsApiRouter.delete("/:_id", checkAdmin, productsController.delete); /* <---- ELIMINAR UN PRODUCTO POR ID*/
