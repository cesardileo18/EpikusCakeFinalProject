import ProductsDTO from "./DTO/products.dto.js";
import { productService } from "../services/products.service.js";
import { cartService } from "../services/carts.service.js";
import { logger } from "../utils/main.js";
import { sendEmail } from "../utils/main.js";
import env from "../config/enviroment.config.js";

class ProductsController {
  async read(req, res) {
    try {
      const products = await productService.read();
      if (!products) {
        logger.error(`Error al leer los products`);
        res.status(200).json({
          status: "error",
          msg: `Error al leer los products`,
        });
      }
      res.status(200).json({
        status: "success",
        payload: products,
      });
    } catch (e) {
      logger.error(e.message);
      return res.status(500).json({
        status: "error",
        msg: "Error en el servidor",
        payload: {},
      });
    }
  }
  async readWithPagination(req, res) {
    try {
      const { limit, pagina, category, orderBy } = req.query;
      const data = await productService.readWithPagination(limit, pagina, category, orderBy);
      const { totalDocs, totalPages, page, hasPrevPage, hasNextPage, prevPage, nextPage } = data;
      res.status(200).json({
        status: "success",
        msg: `Mostrando los ${data.docs.length} productos`,
        payload: data.docs,
        totalDocs: totalDocs,
        totalPages: totalPages,
        prevPage: hasPrevPage ? prevPage : null,
        nextPage: hasNextPage ? nextPage : null,
        page: page,
        hasPrevPage: hasPrevPage,
        hasNextPage: hasNextPage,
        prevLink: hasPrevPage ? `/api/products?limit=${data.limit}&pagina=${prevPage}` : null,
        nextLink: hasNextPage ? `/api/products?limit=${data.limit}&pagina=${nextPage}` : null,
      });
    } catch (e) {
      logger.error(e.message);
      return res.status(500).json({
        status: "error",
        msg: "Error en el servidor",
        payload: {},
      });
    }
  }

  async readByRenderUser(req, res) {
    try {
      const { limit, pagina, category, orderBy } = req.query;
      const data = await productService.readWithPagination(limit, pagina, category, orderBy);
      const { firstName, role, cartId, email, owner } = req.session.user;
      const cart = await cartService.readById(cartId);
      const cartQuantity = cart.products.reduce((total, product) => {
        return total + product.quantity;
      }, 0);

      const { totalPages, page, hasPrevPage, hasNextPage, prevPage, nextPage } = data;

      if (env.persistence === "MONGO") {
        const plainProducts = data.docs.map(doc => doc.toObject());
        const title = "Listado de Productos";
        return res.status(200).render("products", {
          title,
          firstName,
          email,
          role,
          owner,
          cartId,
          cartQuantity,
          plainProducts,
          totalPages,
          page,
          hasPrevPage,
          hasNextPage,
          prevPage,
          nextPage,
        });
      } else {
        return res.status(200).json({
          status: "success",
          msg: "Listado de productos",
          payload: { data },
        });
      }
    } catch (e) {
      logger.error(e.message);
      res.status(501).send({ status: "error", msg: "Error en el servidor", error: e });
    }
  }

  async readByRenderAdmin(req, res) {
    try {
      const userEmail = req.session.user.email;
      const userRol = req.session.user.role;
      const title = "Administrador de Productos";
      const firstName = req.session.user.firstName;
      const data = await productService.read({});
      let products = [];
      if (userRol === "user") {
        products = data
          .filter(prod => prod.owner === userEmail)
          .map(prod => {
            return {
              id: prod._id,
              title: prod.title,
              description: prod.description,
              price: prod.price,
              thumbnail: prod.thumbnail,
              code: prod.code,
              stock: prod.stock,
            };
          });
        return res.status(200).render("products-admin", { products, title, firstName, userRol });
      }
      products = data.map(prod => {
        return {
          id: prod._id,
          title: prod.title,
          description: prod.description,
          price: prod.price,
          thumbnail: prod.thumbnail,
          code: prod.code,
          stock: prod.stock,
        };
      });
      return res.status(200).render("products-admin", { products, title, firstName, userRol });
    } catch (e) {
      logger.error(e.message);
      res.status(501).send({ status: "error", msg: "Error en el servidor", error: e });
    }
  }

  async readById(req, res) {
    try {
      const { _id } = req.params;
      const productById = await productService.readById(_id);
      if (productById) {
        return res.status(201).json({
          status: "success",
          msg: `Mostrando el producto con id ${_id}`,
          payload: { productById },
        });
      } else {
        logger.error(`El producto con ID ${_id} no existe`);
        return res.status(201).json({
          status: "success",
          msg: `El producto con ID ${_id} no existe`,
        });
      }
    } catch (e) {
      logger.error(e.message);
    }
  }

  async create(req, res) {
    try {
      const { title, description, category, price, thumbnail, code, stock } = req.body;
      let productOwner = req.session.user.email;
      let product = new ProductsDTO({
        title,
        description,
        category,
        price,
        thumbnail,
        code,
        stock,
        owner: productOwner,
      });
      const ProductCreated = await productService.create(product);
      return res.status(201).json({
        status: "success",
        msg: "Producto Creado",
        payload: {
          _id: ProductCreated._id,
          title: ProductCreated.title,
          description: ProductCreated.description,
          category: ProductCreated.category,
          price: ProductCreated.price,
          thumbnail: ProductCreated.thumbnail,
          code: ProductCreated.code,
          stock: ProductCreated.stock,
        },
      });
    } catch (e) {
      logger.error(e.message);
      return res.status(500).json({
        status: "error",
        msg: "Error en el servidor",
        payload: {},
      });
    }
  }

  async update(req, res) {
    try {
      const { _id } = req.params;
      const { title, description, category, price, thumbnail, code, stock } = req.body;
      let product = new ProductsDTO({
        title,
        description,
        category,
        price,
        thumbnail,
        code,
        stock,
      });
      try {
        const productUpdated = await productService.update(_id, product);
        if (productUpdated) {
          return res.status(201).json({
            status: "success",
            msg: "product updated",
            payload: `Has actualizado el producto con ID ${_id}`,
          });
        } else {
          return res.status(404).json({
            status: "error",
            msg: "product not found or not updated",
            payload: {},
          });
        }
      } catch (e) {
        logger.error(e.message);
        return res.status(500).json({
          status: "error",
          msg: "Error al actualizar el producto",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e.message);
      return res.status(500).json({
        status: "error",
        msg: "Error en el servidor",
        payload: {},
      });
    }
  }

  async delete(req, res) {
    try {
      const { _id } = req.params;

      const result = await productService.delete(_id);

      if (result?.deletedCount > 0) {
        const isPremium = req.session.user.premium;
        console.log(isPremium);

        if (isPremium) {
          const userEmail = req.session.user.email;
          const subject = "Producto Eliminado";
          const htmlContent = `El producto con ID ${_id} ha sido eliminado de tu cuenta premium.`;

          try {
            await sendEmail(userEmail, subject, htmlContent);
            logger.info(`Correo electrónico enviado a ${userEmail}: ${subject}`);
          } catch (error) {
            logger.error(`Error al enviar el correo electrónico a ${userEmail}:`, error);
          }
        }

        return res.status(200).json({
          status: "success",
          msg: "Producto Eliminado",
          payload: `Has eliminado el producto con ID ${_id}`,
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "El producto no existe",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e.message);
      return res.status(500).json({
        status: "error",
        msg: "Error en el servidor",
        payload: {},
      });
    }
  }
}

export const productsController = new ProductsController();
