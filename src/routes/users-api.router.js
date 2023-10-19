import express from "express";
export const usersApiRouter = express.Router();
import { usersController } from "../controllers/users.controller.js";
import { profileUploader } from "../utils/main.js";

usersApiRouter.get("/", usersController.read); /* <---- LEER TODOS LOS USUARIOS */
usersApiRouter.get("/basic-info", usersController.readBasicInfo); /* <---- LEER TODOS LOS USUARIOS SOLO CON SU INFORMACION BASICA */
usersApiRouter.put("/:_id", usersController.update); /* <---- ACTUALIZAR UN USUARIO POR SU ID */
usersApiRouter.delete("/deleteInactiveUsers", usersController.deleteInactiveUsers); /* <---- ELIMINAR USUARIOS INACTIVOS EN LOS ULTIMOS 2 DIAS*/
usersApiRouter.get("/premium/:uid", usersController.premiumSwitch); /* <---- ACTUALIZAR PROPIEDAD PREMIUM POR ID */
usersApiRouter.get("/role/:uid", usersController.rolSwitch); /* <---- ACTUALIZAR PROPIEDAD ROL POR ID */
usersApiRouter.post("/:uid/profile", profileUploader.single("profileImage"), usersController.postDocuments); /* <---- SUBIR IMAGENES AL PERFIL DE USUARIO */
usersApiRouter.delete("/:_id", usersController.delete); /* <---- ELIMINAR UN USUARIO POR ID */
