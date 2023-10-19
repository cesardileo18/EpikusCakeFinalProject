import UsersDTO from "./DTO/users.dto.js";
import { logger } from "../utils/main.js";
import { UsersMongoose } from "../DAO/mongo/models/users.mongoose.js";

class SessionsController {
  async viewLogin(req, res) {
    try {
      const title = "Epikus Cake - Login";
      return res.status(200).render("login", { title });
    } catch (e) {
      logger.error(e.message);
      res.status(501).send({ status: "error", msg: "Error en el servidor", error: err });
    }
  }

  async viewRegister(req, res) {
    try {
      const title = "Epikus Cake - Register";
      return res.status(200).render("register", { title });
    } catch (e) {
      logger.error(e.message);
      res.status(501).send({ status: "error", msg: "Error en el servidor", error: e });
    }
  }

  async logout(req, res) {
    try {
      if (req.session && req.session.user) {
        const userId = req.session.user._id;
        const user = await UsersMongoose.findById(userId);
        if (user) {
          user.last_connection = new Date();

          await user.save();
        }
        req.session.destroy(err => {
          if (err) {
            console.error("Error al cerrar sesión:", err);
          }
          res.redirect("/");
        });
      } else {
        req.session.destroy(err => {
          if (err) {
            console.error("Error al cerrar sesión:", err);
          }
          res.redirect("/");
        });
      }
    } catch (e) {
      logger.error(e.message);
    }
  }

  async current(req, res) {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }
      const { firstName, lastName, age, email, role, premium } = req.session.user;
      const userDTO = new UsersDTO({
        firstName,
        lastName,
        age,
        email,
        role,
        premium,
      });
      const user = {
        firstName: userDTO.firstName,
        lastName: userDTO.lastName,
        age: userDTO.age,
        email: userDTO.email,
        role: userDTO.role,
        premium: userDTO.premium,
      };
      return res.status(200).json({ user: user });
    } catch (e) {
      logger.info(e);
    }
  }

  async currentUser(req, res) {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }
      const { _id, firstName, lastName, age, email, role, premium, last_connection, documents } = req.session.user;
      const userDTO = new UsersDTO({
        _id,
        firstName,
        lastName,
        age,
        email,
        role,
        premium,
        last_connection,
        documents,
      });
      const user = {
        _id: userDTO._id,
        firstName: userDTO.firstName,
        lastName: userDTO.lastName,
        age: userDTO.age,
        email: userDTO.email,
        role: userDTO.role,
        premium: userDTO.premium,
        last_connection: userDTO.last_connection,
        documents: userDTO.documents,
      };
      return res.status(200).render("current", { user });
    } catch (e) {
      logger.info(e);
    }
  }

  async loginUser(req, res) {
    try {
      if (!req.user) {
        return res.status(400).render("error", { msg: "Usuario Inexistente" });
      }
      req.session.user = {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        age: req.user.age,
        email: req.user.email,
        role: req.user.role,
        premium: req.user.premium,
        cartId: req.user.cartID,
        purchase_made: req.user.purchase_made,
        last_connection: req.user.last_connection,
        documents: req.user.documents,
      };
      return res.redirect("/home");
    } catch (e) {
      logger.info(e);
    }
  }

  async registerUser(req, res) {
    try {
      if (!req.user) {
        return res.status(500).render("error");
      }
      req.session.user = {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        age: req.user.age,
        email: req.user.email,
        role: req.user.role,
        premium: req.user.premium,
        cartId: req.user.cartID,
        purchase_made: req.user.purchase_made,
      };
      return res.redirect("/home");
    } catch (e) {
      logger.info(e);
    }
  }
}

export const sessionsController = new SessionsController();
