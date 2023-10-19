import UsersDTO from "./DTO/users.dto.js";
import { userService } from "../services/users.service.js";
import { logger } from "../utils/main.js";
import { sendEmail } from "../utils/main.js";

class UserController {
  async read(req, res) {
    try {
      const users = await userService.read();
      return res.status(200).json({
        status: "success",
        msg: "listado de usuarios",
        payload: users,
      });
    } catch (e) {
      logger.error(e.message);
      return res.status(500).json({
        status: "error",
        msg: "something went wrong :(",
        payload: {},
      });
    }
  }

  async readBasicInfo(req, res) {
    try {
      const users = await userService.readBasicInfo();
      return res.status(200).json({
        status: "success",
        msg: "listado de usuarios (información básica)",
        payload: users,
      });
    } catch (e) {
      logger.error(e.message);
      return res.status(500).json({
        status: "error",
        msg: "something went wrong :(",
        payload: {},
      });
    }
  }

  async readById(req, res) {
    try {
      const { _id } = req.params;
      const userById = await userService.readById(_id);
      return res.status(201).json({
        status: "success",
        msg: `Mostrando el producto con id ${_id}`,
        payload: { userById },
      });
    } catch (e) {
      logger.error(e.message);
    }
  }

  async readByrender(req, res) {
    try {
      const data = await userService.read();
      const dataParse = data.map(user => {
        const lastConnection = new Date(user.last_connection);
        const formattedLastConnection = lastConnection.toLocaleString();
        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          email: user.email,
          password: user.password,
          role: user.role,
          last_connection: formattedLastConnection,
        };
      });
      const firstName = req.session.user.firstName;
      const role = req.session.user.role;
      const title = "Epikus Cake - Users";
      return res.status(200).render("users", { dataParse, title, firstName, role });
    } catch (e) {
      logger.error(e.message);
      res.status(501).send({ status: "error", msg: "Error en el servidor", error: e });
    }
  }

  async update(req, res) {
    try {
      const { _id } = req.params;
      const { firstName, lastName, age, email, password } = req.body;
      let user = new UsersDTO({ firstName, lastName, age, email, password });
      try {
        const userUpdated = await userService.update(_id, user);
        if (userUpdated) {
          return res.status(201).json({
            status: "success",
            msg: "user uptaded",
            payload: { userUpdated },
          });
        } else {
          return res.status(404).json({
            status: "error",
            msg: "user not found",
            payload: {},
          });
        }
      } catch (e) {
        return res.status(500).json({
          status: "error",
          msg: "db server error while updating user",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e.message);
      return res.status(500).json({
        status: "error",
        msg: "something went wrong :(",
        payload: {},
      });
    }
  }

  async delete(req, res) {
    try {
      const { _id } = req.params;
      const userDeleted = await userService.readById(_id);
      const result = await userService.delete(_id);
      if (result?.deletedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "user deleted",
          payload: { userDeleted },
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "user not found",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e.message);
      return res.status(500).json({
        status: "error",
        msg: "something went wrong :(",
        payload: {},
      });
    }
  }

  async deleteInactiveUsers(req, res) {
    try {
      const deletedUsers = await userService.deleteInactiveUsers();

      for (const user of deletedUsers) {
        const to = user.email;
        const subject = "Cuenta eliminada por inactividad";
        const htmlContent = `
        <div>
          <h1>Hola ${user.firstName || "Usuario"},</h1>
          <p>Tu cuenta ha sido eliminada debido a la inactividad durante los últimos 2 días.</p>
          <p>Epikus Cake</p>
        </div>
      `;
        await sendEmail(to, subject, htmlContent);
      }
      return res.status(200).json({
        status: "success",
        msg: "Usuarios inactivos eliminados y notificados por correo electrónico",
        payload: deletedUsers,
      });
    } catch (e) {
      logger.error(e.message);
      return res.status(500).json({
        status: "error",
        msg: "something went wrong :(",
        payload: {},
      });
    }
  }

  async loginUser(email, password) {
    try {
      const user = await userService.authenticateUser(email, password);
      return user;
    } catch (e) {
      logger.error(e.message);
      return null;
    }
  }

  async registerUser(req) {
    try {
      const { firstName, lastName, age, email, password } = req.body;
      const role = "user";
      const userCreated = await userService.registerUser(firstName, lastName, age, email, password, role);
      return userCreated;
    } catch (e) {
      logger.error(e.message);
      return null;
    }
  }

  async premiumSwitch(req, res) {
    try {
      const userId = req.params.uid;
      const user = await userService.premiumSwitch(userId);
      req.session.user.premium = user.premium;

      const responseMessage = `Se ha actualizado correctamente la propiedad premium del usuario a ${req.session.user.premium}`;

      res.status(200).json({
        message: responseMessage,
        user: user,
      });
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  }

  async rolSwitch(req, res) {
    try {
      const userId = req.params.uid;
      const user = await userService.rolSwitch(userId);
      req.session.user.role = user.role;

      const responseMessage = `Se ha actualizado correctamente la propiedad rol del usuario a ${req.session.user.role}`;

      res.status(200).json({
        message: responseMessage,
        user: user,
      });
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  }

  async postDocuments(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ status: "error", msg: "No se ha proporcionado un archivo." });
      }

      const { uid } = req.params;
      const file = req.file;
      await userService.postDocuments(uid, file);

      return res.status(200).render("current");
    } catch (e) {
      console.error(e.message);
      return res.status(500).json({
        status: "error",
        msg: "Error al subir la imagen de perfil.",
        error: e.message,
      });
    }
  }
}

export const usersController = new UserController();
