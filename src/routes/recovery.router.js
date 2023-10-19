import express from "express";
export const recovery = express.Router();
import { logger } from "../utils/main.js";
import { recoveryController } from "../controllers/recovery.controller.js";

recovery.get("/", async (req, res) => {
  try {
    const title = "Epikus Cake";
    return res.status(200).render("recovery", { title });
  } catch (e) {
    logger.error(e.message);
    res
      .status(501)
      .send({ status: "error", msg: "Error en el servidor", error: e });
  }
});

recovery.post("/", recoveryController.sendEmail);
recovery.get("/pass", recoveryController.findToken);
recovery.post("/pass", recoveryController.newPassword)
