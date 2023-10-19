import express from "express";
export const login = express.Router();
import { logger } from "../utils/main.js";

login.get("/", async (req, res) => {
	try {
		const title = "Epikus Cake";
		return res.status(200).render("sessions", { title });
	} catch (e) {
		logger.error(e.message);
		res
			.status(501)
			.send({ status: "error", msg: "Error en el servidor", error: e });
	}
});
