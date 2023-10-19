import { logger } from "../utils/main.js";
import { recoveryService } from "../services/recovery.service.js";

class RecoveryController {
  async sendEmail(req, res) {
    try {
      const { email } = req.body;
      const result = await recoveryService.sendEmail(email);
      if (result !== null) {
        res.status(200).render("error", { emailSend: "Email Enviado! Revisa tu casilla." });
      } else {
        return res.status(400).render("error", { errorMsg: "Email inexistente" });
      }
    } catch (e) {
      logger.error(e.message);
    }
  }

  async findToken(req, res) {
    try {
      const { token, email } = req.query;
      const foundToken = await recoveryService.findToken(token, email);
      if (foundToken && foundToken.expire > Date.now()) {
        const validToken = foundToken.token;
        const validEmail = foundToken.email;
        const title = "Epikus Cake";
        return res.status(200).render("recovery-pass", { title, validToken, validEmail });
      } else {
        return res.status(404).render("error", { errorMsg: "Token expirado o inválido" });
      }
    } catch (e) {
      logger.error(e.message);
      res.status(501).send({ status: "error", msg: "Error en el servidor", error: e });
    }
  }

  async newPassword(req, res) {
    try {
      let { token, email, password } = req.body;
      const foundToken = await recoveryService.findToken(token, email);
      const userEmail = foundToken.email;
      const foundUser = await recoveryService.newPassword(userEmail, password, token);
      if (foundToken && foundToken.expire > Date.now() && password) {
        return res.status(200).render("error", { changePassword: "Contraseña Actualizada!" });
      } else {
        return res.status(404).render("error", { errorMsg: "Token expirado o inválido" });
      }
    } catch (e) {
      logger.error(e.message);
      throw new Error(e);
    }
  }
}

export const recoveryController = new RecoveryController();
