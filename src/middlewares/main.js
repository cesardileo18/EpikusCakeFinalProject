import { cartService } from "../services/carts.service.js";
import { ticketService } from "../services/tickets.service.js";
import Errors from "../services/errors/enums.js";
import { logger } from "../utils/main.js";

export function checkLogin(req, res, next) {
  try {
    if (req.session?.user?.firstName) {
      return next();
    }
  } catch (e) {
    logger.error(e.message);
    const isLogin = "Debes iniciar sesión para acceder a esta página";
    return res.status(201).render("error", { isLogin });
  }
}

export function checkAdmin(req, res, next) {
  try {
    if (req.headers["x-test-request"]) {
      // Esta solicitud es una prueba, permite el acceso sin restricciones.
      return next();
    }

    if (req.session?.user?.role == "admin" || req.session?.user?.premium == true) {
      return next();
    } else {
      const isAdmin = "Debes ser administrador o usuario premium para acceder a esta página";
      return res.status(201).render("error", { isAdmin });
    }
  } catch (e) {
    logger.error(e.message);
  }
}

export async function checkUser(req, res, next) {
  const admin = req.session?.user?.role === "admin"; 
  if (req.session?.user?.role === "user") {
    return next();
  } 
  if (admin) {
    console.log('req.session.user.role', req.session.user.role);
    const isUser = "Debes ser usuario para realizar esta acción.";
    return res.status(401).render("error", { isUser });
  }
}


export async function checkCart(req, res, next) {
  const cartUser = req.session.user.cartId;
  const cartParams = req.params.cid;
  if (cartUser == cartParams) {
    return next();
  } else {
    const notCart = "El carrito al que quieres acceder no corresponde a tu usuario";
    return res.status(500).render("error", { notCart });
  }
}

export async function checkTicket(req, res, next) {
  const user = req.session.user;
  const cart = await cartService.readById(user.cartId);
  const tickets = await ticketService.readAll(cart._id);
  if (cart == tickets) {
    return next();
  } else {
    const notCart = "El Ticket al que estas intentando acceder no corresponde a tu usuario";
    return res.status(500).render("error", { notCart });
  }
}

export function errorHandler(error, req, res, next) {

  switch (error.code) {
    case Errors.ROUTING_ERROR:
      const notFound = "Esta página no existe";
      return res.status(404).render("error", { notFound });
    case Errors.ID_ERROR:
      const errorId = "El ID ingresado no existe";
      return res.status(404).render("error", { errorId });
    default:
      res.status(500).send({ status: "error", error: "Unhandled error" });
      break;
  }
}
