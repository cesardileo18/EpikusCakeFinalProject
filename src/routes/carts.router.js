import express from "express";
export const cartsRouter = express.Router();
import { cartsController } from "../controllers/carts.controller.js";
import { ticketsController } from "../controllers/tickets.controller.js";
import { checkCart, checkUser, checkLogin } from "../middlewares/main.js";

cartsRouter.get("/:cid", checkLogin, checkCart, cartsController.readByRender); /* <---- RENDERIZAR EL CARRO DEL USUARIO LOGEADO */
cartsRouter.post("/:cid/products/:pid", checkCart, checkUser, cartsController.addProduct); /* <---- AGREGAR PRODUCTO AL CARRITO */
cartsRouter.put("/:cid/products/:pid", cartsController.updateProductQuantity); /* <---- ACTUALIZAR CANTIDAD DEL PRODUCTO */
cartsRouter.delete("/:cid/products/:pid", cartsController.deleteProduct); /* <---- ELIMINAR PRODUCTO */
cartsRouter.delete("/:cid", cartsController.emptyCart); /* <---- VACIAR CARRITO */
cartsRouter.post("/:cid/purchase", checkCart, checkUser, ticketsController.create); /* <---- FINALIZAR COMPRA */
