import importModels from "../DAO/factory.js";
import bcrypt from "bcrypt";
import { createHash, isValidPassword } from "../utils/main.js";
import { generateCartId } from "../utils/main.js";
import { cartService } from "./carts.service.js";
import { logger } from "../utils/main.js";

const models = await importModels();
const usersModel = models.users;

class UserService {
  async readOne(email, password) {
    try {
      const user = await usersModel.read(email);
      if (user && isValidPassword(password, user.password)) {
        return user;
      } else {
        return false;
      }
    } catch (e) {
      logger.error(e.message);
    }
  }

  async read() {
    try {
      const users = await usersModel.read();
      return users;
    } catch (e) {
      logger.error(e.message);
    }
  }

  async readBasicInfo() {
    try {
      const users = await usersModel.readBasicInfo();
      return users;
    } catch (e) {
      logger.error(e.message);
    }
  }

  async readById(_id) {
    try {
      const user = await usersModel.readById(_id);
      return user;
    } catch (e) {
      logger.error(e.message);
      throw e;
    }
  }

  async update(_id, user) {
    try {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }

      const userUpdated = await usersModel.update(_id, user);
      return userUpdated;
    } catch (e) {
      logger.error(e.message);
    }
  }

  async delete(_id) {
    try {
      const userDeleted = await usersModel.delete(_id);
      return userDeleted;
    } catch (e) {
      logger.error(e.message);
    }
  }

  async deleteInactiveUsers() {
    try {
      const thresholdDays = 2; // Establece el umbral de días en 2
      const currentDate = new Date().toISOString();

      // Encuentra a los usuarios inactivos que han estado inactivos durante más de dos días
      const deletedUsers = await usersModel.findInactiveUsers(thresholdDays, currentDate);

      // Elimina a los usuarios inactivos
      await usersModel.deleteInactiveUsers(deletedUsers);

      return deletedUsers;
    } catch (e) {
      logger.error(e.message);
      throw e;
    }
  }

  async authenticateUser(email, password) {
    try {
      const user = await usersModel.readOne(email);

      if (!user || !isValidPassword(password, user.password)) {
        throw new Error("Invalid credentials");
      }

      return user;
    } catch (e) {
      logger.error(e.message);
      throw e;
    }
  }

  async registerUser(firstName, lastName, age, email, password, role) {
    try {
      const existingUser = await usersModel.readOne(email);

      if (existingUser) {
        throw new Error("User already exists");
      }

      const cartID = generateCartId();
      const hashedPassword = createHash(password);
      await cartService.createCart(cartID);
      const userCreated = await usersModel.create(firstName, lastName, age, email, hashedPassword, role, cartID);

      return userCreated;
    } catch (e) {
      logger.error(e.message);
      throw e;
    }
  }

  async premiumSwitch(userId) {
    try {
      const user = await this.readById(userId);
      if (!user) {
        throw new Error("Usuario inexistente");
      }
      user.premium = !user.premium;
      const updatedUser = await this.update(userId, { premium: user.premium });
      return updatedUser;
    } catch (e) {
      logger.error(e.message);
      throw e;
    }
  }

  async rolSwitch(userId) {
    try {
      const user = await this.readById(userId);
      if (!user) {
        throw new Error("Usuario inexistente");
      }
      if (user.role === "admin") {
        user.role = "user";
      } else if (user.role === "user") {
        user.role = "admin";
      }
      const updatedUser = await this.update(userId, { role: user.role });
      return updatedUser;
    } catch (e) {
      logger.error(e.message);
      throw e;
    }
  }

  async postDocuments(uid, file) {
    try {
      const updatedUser = await usersModel.postDocuments(uid, file);
      return updatedUser;
    } catch (e) {
      logger.error(e.message);
      throw e;
    }
  }
}
export const userService = new UserService();
