import * as express from "express";
import { Template as Dto } from "../../prisma/generated/models";
import validationMiddleware from "../../middleware/validation.middleware";
import authMiddleware from "../../middleware/auth.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import ServerException from "../../exceptions/ServerException";
// import {  } from "../../Models";

const { saveFilesToS3, storeImage } = require("../../utils/fileUploadHandler");

class TemplateController extends BaseController {
  public tablePrismaName = "Template";
  public get = "/Template/:id";
  public read = "/Template";
  public delete = "/Template/:id";
  public create = "/Template/";
  public router = express.Router();
  constructor() {
    super();
    this.intializeRoutes();
  }
  public intializeRoutes() {
    /**
     * @swagger
     * /Template:
     *   get:
     *     summary: Get all Templates
     *     tags:
     *       - Templates
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         description: The page number to retrieve
     *         required: true
     *         schema:
     *           type: integer
     *       - in: query
     *         name: pageSize
     *         description: The page number to retrieve
     *         required: true
     *         schema:
     *           type: integer
     *
     *     responses:
     *       200:
     *         description: An array of Templates
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       401:
     *         description: Unauthorized
     */
    this.router.get(this.read, authMiddleware, this.getAll);
    /**
     * @swagger
     * /Template/{id}:
     *   get:
     *     summary: Get single Templates
     *     tags:
     *       - Templates
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         description: the Template id
     *         required: true
     *         schema:
     *           type: integer
     *
     *     responses:
     *       200:
     *         description: An array of Templates
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       404:
     *         description: Not Found
     *       401:
     *         description: Unauthorized
     */
    this.router.get(this.get, authMiddleware, this.getById);
    /**
     * @swagger
     * /Template:
     *   post:
     *     summary: create update Templates (to know all the params please request with empty body and check the response)
     *     tags:
     *       - Templates
     *     security:
     *       - BearerAuth: []
     *
     *     responses:
     *       200:
     *         description: An array of Templates
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       401:
     *         description: Unauthorized
     */
    this.router.post(
      this.create,
      authMiddleware,
      validationMiddleware(Dto),
      storeImage,
      this.createUpdate
    );
    /**
     * @swagger
     * /Template/{id}:
     *   delete:
     *     summary: delete single Template
     *     tags:
     *       - Templates
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         description: the Template id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: just 200
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       404:
     *         description: Not Found
     *       401:
     *         description: Unauthorized
     */
    this.router.delete(this.delete, authMiddleware, this.hardDelete);
  }
  getById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const object = await this.prismaClient[this.tablePrismaName].findFirst({
        where: {
          id: +request.params.id,
        },
      });
      if (!object) {
        next(new NotFoundException(request.params.id, this.tablePrismaName));
        return;
      }
      response.json(object);
    } catch (error) {
      console.error(error);
      next(new ServerException());
    }
  };
  getAll = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { page, pageSize, name } = request.query;
      const where = {};
      let Objects = await this.prismaClient[this.tablePrismaName].findMany({
        where,
        take: +pageSize,
        skip: pageSize * page,
        orderBy: [
          {
            id: "desc",
          },
        ],
      });
      const objectsCount = await this.prismaClient[this.tablePrismaName].count({
        where,
      });
      Objects = Objects.map((o) => {
        return {
          ...o,
          name: o[`name_${request.headers.lang}`],
        };
      });
      response.json({
        data: Objects,
        records: objectsCount,
        pages: this.calculatePages(pageSize, objectsCount),
      });
    } catch (error) {
      console.error(error);
      next(new ServerException());
    }
  };
  createUpdate = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const dto: Dto = request.body;
      const data = {
        ...dto,
      };
      let result;
      const coverPicPaths: any[] = await saveFilesToS3(request.files.image);
      if (dto.id === undefined && coverPicPaths.length == 0) {
        next(new HttpException(422, "Files are missing"));
        return;
      }
      if (!dto.id || dto.id === 0) {
        result = await this.prismaClient[this.tablePrismaName].create({
          data: {
            ...data,
            coverpic: coverPicPaths[0].path,
            createdAt: new Date(),
            createdByUser: { connect: { id: global.user.id } },
          },
        });
      } else
        result = await this.prismaClient[this.tablePrismaName].update({
          data: {
            ...data,
            coverpic:
              coverPicPaths.length != 0 ? coverPicPaths[0].path : undefined,
            updatedByUser: { connect: { id: global.user.id } },
          },
          where: { id: +dto.id },
        });
      response.send(result);
    } catch (error) {
      console.log(error);
      next(new HttpException(0, error));
    }
  };
  hardDelete = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await this.prismaClient[this.tablePrismaName].delete({
        where: {
          id: parseInt(request.params.id),
        },
      });
      response.sendStatus(200);
    } catch (error) {
      next(new NotFoundException(request.params.id, this.tablePrismaName));
    }
  };
}
export default TemplateController;
