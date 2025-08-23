import { IController } from "@/common/interfaces";
import { CursorPaginationMeta, PagePaginationMeta } from "@/common/types";
import { User as PrismaUser } from "@/generated/prisma";

type OkAndCreatedOpts = {
  message?: string;
};

type PaginatedOpts =
  | {
      message?: string;
      type: "page";
      pagination: Omit<
        PagePaginationMeta,
        "total_pages" | "has_next_page" | "has_previous_page"
      >;
    }
  | {
      message?: string;
      type: "cursor";
      pagination: CursorPaginationMeta;
    };

type SuccessOptions = {
  message?: string;
  status?: number;
};

declare global {
  namespace Express {
    interface Application {
      registerCors: () => this;
      registerSecurity: () => this;
      registerParsers: () => this;
      registerSanitizers: () => this;
      registerThrottler: () => this;
      registerCompression: () => this;
      registerCSRF: () => this;
      registerControllers: (controllers: IController[]) => this;
      registerSwagger: () => this;
      registerErrorHandlers: () => this;
      bootstrap: () => void;
    }

    interface Request {
      id?: string;
      currUser?: PrismaUser;
      signInAttempts?: number;
    }

    interface Response {
      ok: (data: unknown, opts?: OkAndCreatedOpts) => void;
      created: (data: unknown, opts?: OkAndCreatedOpts) => void;
      noContent: () => void;
      paginated: (data: unknown, opts: PaginatedOpts) => void;
      success: (data: unknown, opts?: SuccessOptions) => void;
    }
  }
}
