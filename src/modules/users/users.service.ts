import { Prisma, PrismaClient, User } from "@/generated/prisma";

export class UserService {
  constructor(private readonly db: PrismaClient) {
    this.db = db;
  }
  async getAll() {
    return await this.db.user.findMany();
  }

  async getOne(studentId: User["id"]) {
    return await this.db.user.findUnique({
      where: { id: studentId },
    });
  }

  async create(body: Prisma.UserCreateInput) {
    return await this.db.user.create({
      data: body,
    });
  }

  async update(studentId: User["id"], body: Prisma.UserUpdateInput) {
    return await this.db.user.update({
      where: { id: studentId },
      data: body,
    });
  }

  async delete(studentId: User["id"]) {
    return await this.db.user.delete({
      where: { id: studentId },
    });
  }
}
