import express from "express";
export const cartsApiRouter = express.Router();
import { cartsController } from "../controllers/carts.controller.js";

cartsApiRouter.post("/:cid/products/:pid", cartsController.addProduct); /* <---- AGREGAR PRODUCTO AL CARRITO */
cartsApiRouter.get("/", cartsController.read); /* <---- LEER TODOS LOS CARRITOS */
cartsApiRouter.get("/:cid", cartsController.readById); /* <---- LEER EL CARRITO POR ID */
cartsApiRouter.put("/:cid", cartsController.updateCart); /* <---- ACTUALIZAR EL CARRITO */
cartsApiRouter.put("/:cid/products/:pid", cartsController.updateProductQuantity); /* <---- ACTUALIZAR SOLO LA CANTIDAD DE UN PRODUCTO ESPECIFICO */
cartsApiRouter.delete("/:cid", cartsController.emptyCart); /* <---- VACIAR CARRITO */
cartsApiRouter.delete("/:cid/products/:pid", cartsController.deleteProduct); /* <---- ELIMINAR PRODUCTO DEL CARRITO */
