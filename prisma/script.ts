import { faker } from "@faker-js/faker";
import chalk from "chalk";
import { Command } from "commander";
import ora, { Ora } from "ora";
import { z } from "zod";

import { Prisma, PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();
const program = new Command();

program
  .name("seed")
  .description("Seed or reset the database")
  .option("--reset", "reset the database only, without seeding")
  .option(
    "-c, --count <number>",
    "total number of records to seed (1-1000) defalut 100",
    Number,
    100
  )
  .parse(process.argv);

const programOptionsSchema = z.object({
  count: z.number().default(100),
  reset: z.boolean().optional(),
});

const { count, reset } = programOptionsSchema.parse(program.opts());

let spinner: Ora;

async function main() {
  spinner = ora("Resetting database...").start();

  await prisma.$transaction([
    prisma.account.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.revokedToken.deleteMany(),
    prisma.token.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  spinner.succeed("Database reset successfully");

  const startTime = Date.now();

  if (reset) {
    const duration = Date.now() - startTime;
    console.log(chalk.bold.yellow(`\nReset took ${duration} ms`));
    return;
  }

  spinner = ora(`Seeding ${count} records...`).start();

  const userData = Array.from({ length: count }, (): Prisma.UserCreateInput => {
    const provider = faker.helpers.arrayElement([
      "google",
      "github",
      "credentials",
    ]);
    const accountType = provider === "credentials" ? "credentials" : "oauth";

    return {
      email: faker.internet.email(),
      password: faker.internet.password(),
      Profile: { create: { name: faker.person.fullName() } },
      Account: { create: { provider, type: accountType } },
    };
  });

  const createPromises = userData.map((user) =>
    prisma.user.create({ data: user })
  );

  try {
    await prisma.$transaction(createPromises);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        console.log(
          chalk.red(
            "\nTransaction rolled back due to a unique constraint violation",
            "\nNo records inserted",
            "\nFaker may have generated duplicate data, Please reduce the seed count"
          )
        );
        process.exit(0);
      }
    }
  }

  spinner.succeed(`Seeded ${count} records successfully`);

  const duration = Date.now() - startTime;

  console.log(chalk.bold.yellow(`\nSeeded took ${duration} ms`));
}

main()
  .catch((err) => {
    console.error(chalk.red("Seeder failed:"), err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

process.on("SIGINT", async () => {
  if (spinner && spinner.isSpinning) {
    spinner.stop();
  }

  console.log(chalk.yellow("\nGracefully shutting down..."));
  await prisma.$disconnect();
  process.exit(0);
});
