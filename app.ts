import * as express from "express";
import * as bodyParser from "body-parser";
import errorMiddleware from "./middleware/error.middleware";
require("dotenv").config();
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const glob = require("glob");
var options = {
  customCss: ".swagger-ui .topbar { display: none }",
  swaggerDefinition: {
    info: {
      title: `${process.env.APP_NAME} API`,
      version: "1.0.0",
    },
    securityDefinitions: {
      BearerAuth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
      },
    },
  },

  apis: glob.sync("./Models/**/*.ts"),
};

const specs = swaggerJsdoc(options);

class App {
  public app: express.Application;
  public port: number;

  constructor(controllers, port) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  private initializeControllers(controllers) {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
    this.app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(specs);
    });
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}

export default App;
