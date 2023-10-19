import { logger } from "../utils/main.js";
import { randomBytes } from "crypto";
import { IsValidEmail } from "../utils/main.js";
import { UsersMongoose } from "../DAO/mongo/models/users.mongoose.js";
import { usersModel } from "../DAO/mongo/users.model.js";
import { emailRecovery } from "../utils/emailRecovery.js";
import env from "../config/enviroment.config.js";
import { RecoverTokensMongoose } from "../DAO/mongo/models/recover-tokens.mongoose.js";
import { createHash } from "../utils/main.js";

class RecoveryService {
  async sendEmail(email) {
    try {
      if (IsValidEmail(email)) {
        const validEmail = email;
        const user = await usersModel.readOne(validEmail);
        if (user) {
          const token = randomBytes(20).toString("hex");
          const expire = Date.now() + 3600000;
          const tokenSaved = await RecoverTokensMongoose.create({
            email: validEmail,
            token,
            expire,
          });

          const emailOptions = {
            to: user.email,
            subject: "Recuperación de contraseña",
            html: `
              <div>
                <h1>Recuperación de contraseña</h1>
                <p>Estás recibiendo este correo porque has solicitado una recuperación de contraseña.</p>
                <p>Tu token de recuperación es: <span style="font-size: 16px; font-weight: bold;">${token}</span></p>
				<a href="${env.apiUrl}/recovery/pass?token=${token}&email=${email}">Ingresa aquí para cambiar la contraseña.</a>
              </div>
            `,
          };
          await emailRecovery(emailOptions);

          return user.email;
        } else {
          const user = null;
          return user
        }
      } else {
        throw new Error("Correo Electrónico inválido.");
      }
    } catch (e) {
      logger.error(e.message);
      throw new Error(e);
    }
  }

  async findToken(token, email) {
    try {
      const foundToken = await RecoverTokensMongoose.findOne({ token, email });
      return foundToken;
    } catch (e) {
      logger.error(e.message);
    }
  }

  async newPassword(userEmail, password, token) {
    try {
      const foundToken = await this.findToken(token, userEmail);
      const foundUser = await UsersMongoose.findOne({ email: userEmail });
      if (foundToken && foundToken.expire > Date.now() && password) {
        const user = foundUser.email;
        password = createHash(password);
        const updatedUser = await UsersMongoose.updateOne({ email: user }, { password });
        return updatedUser;
      }
      if (!foundUser) {
        logger.error(`No se encontró ningún usuario con el correo electrónico: ${email}`);
      }
    } catch (e) {
      logger.error(e.message);
      throw new Error(e);
    }
  }
}

export const recoveryService = new RecoveryService();
