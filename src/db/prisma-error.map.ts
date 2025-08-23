import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
} from "@/common/exceptions";
import { Prisma } from "@/generated/prisma";

export const PrismaErrorMap = new Map<
  string,
  { exception: (err: Prisma.PrismaClientKnownRequestError) => HttpException }
>([
  [
    "P2000",
    {
      exception: (err) =>
        new BadRequestException("Value too long for column", {
          code: "value_too_long",
          details: err.meta,
        }),
    },
  ],
  [
    "P2001",
    {
      exception: (err) =>
        new NotFoundException("Record not found", {
          code: "record_not_found",
          details: err.meta,
        }),
    },
  ],
  [
    "P2002",
    {
      exception: (err) =>
        new ConflictException("Unique constraint violation", {
          code: "unique_constraint_failed",
          details: err.meta,
        }),
    },
  ],
  [
    "P2003",
    {
      exception: (err) =>
        new BadRequestException("Foreign key constraint failed", {
          code: "foreign_key_constraint_failed",
          details: err.meta,
        }),
    },
  ],
  [
    "P2025",
    {
      exception: (err) =>
        new NotFoundException("Record not found", {
          code: "record_not_found",
          details: err.meta,
        }),
    },
  ],
]);
