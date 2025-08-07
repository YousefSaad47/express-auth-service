import { RequestHandler, Router } from "express";

import { Prisma } from "@/generated/prisma";
import { IController } from "@/interfaces/Icontroller";
import { NotFoundError } from "@/lib/errors/http-errors";
import { registerPath } from "@/lib/openapi/registery";

import { UserService } from ".";
import {
  userInsertSchema,
  UserSelect,
  userSelectSchema,
  userUpdateSchema,
} from "./users.validation";

export class UserController implements IController {
  router: Router;
  constructor(
    public readonly path: string,
    private readonly service: UserService
  ) {
    this.router = Router();
    this.initializeRoutes();
    this.registerOpenApi();
  }

  private initializeRoutes() {
    this.router.route("/").get(this.getAll).post(this.create);
    this.router
      .route("/:userId")
      .get(this.getOne)
      .patch(this.update)
      .delete(this.delete);
  }

  private registerOpenApi() {
    registerPath({
      tags: ["Users"],
      method: "get",
      path: this.path,
      summary: "Get all users",
      statusCode: 200,
      responseDescription: "List of users",
    });

    registerPath({
      tags: ["Users"],
      method: "get",
      path: `${this.path}/:userId`,
      summary: "Get one user",
      paramsSchema: userSelectSchema,
      statusCode: 200,
      responseDescription: "User details",
    });

    registerPath({
      tags: ["Users"],
      method: "post",
      path: this.path,
      summary: "Create a user",
      bodySchema: userInsertSchema,
      statusCode: 201,
      responseDescription: "Created user",
    });

    registerPath({
      path: `${this.path}/:userId`,
      method: "patch",
      tags: ["Users"],
      summary: "Update a user",
      bodySchema: userUpdateSchema,
      paramsSchema: userSelectSchema,
      statusCode: 200,
      responseDescription: "Updated user",
    });

    registerPath({
      path: `${this.path}/:userId`,
      method: "delete",
      tags: ["Users"],
      summary: "Delete a user",
      paramsSchema: userSelectSchema,
      statusCode: 200,
      responseDescription: "Deleted user",
    });
  }

  private getAll: RequestHandler = async (req, res) => {
    const users = await this.service.getAll();
    res.status(200).json(users);
  };

  private getOne: RequestHandler<UserSelect> = async (req, res) => {
    const userId = req.params.userId;
    const user = await this.service.getOne(userId);

    if (!user) {
      throw new NotFoundError("User not found", { userId });
    }

    res.status(200).json(user);
  };

  private create: RequestHandler<unknown, unknown, Prisma.UserCreateInput> =
    async (req, res) => {
      const user = await this.service.create(req.body);

      res.status(201).json(user);
    };

  private update: RequestHandler<UserSelect> = async (req, res) => {
    const userId = req.params.userId;
    const body = req.body;

    const updatedUser = await this.service.update(userId, body);

    if (!updatedUser) {
      throw new NotFoundError("User not found", { userId });
    }

    res.status(200).json(updatedUser);
  };

  private delete: RequestHandler<UserSelect> = async (req, res) => {
    const userId = req.params.userId;

    const deletedUser = await this.service.delete(userId);

    if (!deletedUser) {
      throw new NotFoundError("User not found", { userId });
    }

    res.status(200).json(deletedUser);
  };
}
