import MongoStore from "connect-mongo";
import express from "express";
import "express-async-errors";
import compression from "express-compression";
import handlebars from "express-handlebars";
import session from "express-session";
import passport from "passport";
import FileStore from "session-file-store";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import env from "./config/enviroment.config.js";
import { iniPassport } from "./config/passport.config.js";
import { errorHandler } from "./middlewares/main.js";
import { cartsApiRouter } from "./routes/carts-api.router.js";
import { cartsRouter } from "./routes/carts.router.js";
import { errorRouter } from "./routes/error.router.js";
import { home } from "./routes/home.router.js";
import { loggers } from "./routes/loggers.router.js";
import { login } from "./routes/login.router.js";
import { mockingProductsRouter } from "./routes/mocking-products.router.js";
import { sendEmailRouter } from "./routes/sendEmail.router.js";
import { productsAdminRouter } from "./routes/products-admin-router.js";
import { productsApiRouter } from "./routes/products-api.router.js";
import { productsRouter } from "./routes/products.router.js";
import { purchasesRouter } from "./routes/purchases.router.js";
import { recovery } from "./routes/recovery.router.js";
import { sessionsRouter } from "./routes/sessions.router.js";
import { testChatRouter } from "./routes/test-chat.router.js";
import { apiTickets } from "./routes/tickets.router.js";
import { usersApiRouter } from "./routes/users-api.router.js";
import { usersRouter } from "./routes/users.router.js";
import CustomError from "./services/errors/custom-error.js";
import Errors from "./services/errors/enums.js";
import { connectMongo, connectSocketServer, logger } from "./utils/main.js";

// CONFIG BASICAS Y CONEXION A DB
const app = express();
app.use(compression({ brotli: { enabled: true, zlib: {} } }));
const PORT = env.port;
const fileStore = FileStore(session);

connectMongo();

// HTTP SERVER
const httpServer = app.listen(PORT, () => {
  logger.info(`Levantando en puerto http://localhost:${PORT}`);
});

connectSocketServer(httpServer);
app.use(
  session({
    secret: "jhasdkjh671246JHDAhjd",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: env.mongoUrl,
      dbName: "ecommerce",
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 3600,
    }),
  }),
);

// DIRNAME CONFIG
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// MIDDLEWARES BASICOS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// CONFIG DEL MOTOR DE PLANTILLAS
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

// CONFIG DE PASSPORT
iniPassport();
app.use(passport.initialize());
app.use(passport.session());

// SWAGGER DOCUMENTATION
const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentación Epikus Cake API",
      description: "Tienda Online Pasteleria, Reposteria",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};

const specs = swaggerJSDoc(swaggerOptions);
app.use("/api/doc", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// ENDPOINTS
app.use("/api/products", productsApiRouter);
app.use("/api/carts", cartsApiRouter);
app.use("/api/users", usersApiRouter);
app.use("/api/mockingproducts", mockingProductsRouter);
app.use("/loggerTest", loggers);
app.use("/send-email", sendEmailRouter);
app.use("/api/tickets", apiTickets);
app.use("/api/sessions", sessionsRouter);
app.get("/api/sessions/github", passport.authenticate("github", { scope: ["user:email"] }));
app.get("/api/sessions/githubcallback", passport.authenticate("github", { failureRedirect: "/error" }), (req, res) => {
  req.session.user = {
    firstName: req.user.firstName,
    role: req.user.role,
  };
  res.redirect("/home");
});
// PLANTILLAS
app.use("/", login);
app.use("/home", home);
app.use("/recovery", recovery);
app.use("/products", productsRouter);
app.use("/products-admin", productsAdminRouter);
app.use("/users", usersRouter);
app.use("/cart", cartsRouter);
app.use("/purchases", purchasesRouter);
app.use("/test-chat", testChatRouter);
app.use("/error", errorRouter);

app.get("*", (req, res, next) => {
  try {
    CustomError.createError({
      name: "Page Not Found",
      cause: "Non existent path",
      message: "The path you are trying to access does not exist",
      code: Errors.ROUTING_ERROR,
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);
