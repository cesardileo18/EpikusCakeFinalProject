import env from "../config/enviroment.config.js";
import nodemailer from "nodemailer";
import { logger } from "./main.js";

export async function emailRecovery(options) {
  const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: env.googleEmail,
      pass: env.googlePass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const result = await transport.sendMail({
      from: env.googleEmail,
      ...options,
    });
    logger.info("Correo electrónico enviado exitosamente.");
    return result;
  } catch (error) {
    logger.error("Error al enviar el correo electrónico:", error);
    throw error;
  }
}
