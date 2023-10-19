import express from "express";
export const errorRouter = express.Router();
import { logger } from "../utils/main.js";

errorRouter.get("/", async (req, res) => {
	try {
		const errorMsg = req.session.errorMsg;
		req.session.errorMsg = null;
		const title = "Epikus Cake";
		return res.status(200).render("error", { title, errorMsg });
	} catch (e) {
		logger.error(e.message);
		res.status(501).send({ status: "error", msg: "Error en el servidor", error: e });
	}
});
