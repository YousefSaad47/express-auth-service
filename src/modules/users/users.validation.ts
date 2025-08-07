import { faker } from "@faker-js/faker";
import { z } from "zod";

export const userSelectSchema = z
  .object({ userId: z.uuid() })
  .openapi("UserSelectSchema", {
    default: { userId: faker.string.uuid() },
  });

export type UserSelect = z.infer<typeof userSelectSchema>;

export const userInsertSchema = z
  .object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  })
  .openapi("UserInsertSchema", {
    default: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
    },
  });

export type UserInsert = z.infer<typeof userInsertSchema>;

export const userUpdateSchema = userInsertSchema
  .partial()
  .openapi("UserUpdateSchema", {
    default: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
    },
  });

export type UserUpdate = z.infer<typeof userUpdateSchema>;
