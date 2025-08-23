/* eslint-disable @typescript-eslint/no-explicit-any */

import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const googleOAuth = registry.registerComponent(
  "securitySchemes",
  "GoogleOAuth",
  {
    type: "oauth2",
    flows: {
      authorizationCode: {
        authorizationUrl: process.env.GOOGLE_CALLBACK_URL,
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: {
          profile: "Access user profile",
          email: "Access user email",
        },
      },
    },
  }
);

const githubOAuth = registry.registerComponent(
  "securitySchemes",
  "GitHubOAuth",
  {
    type: "oauth2",
    flows: {
      authorizationCode: {
        authorizationUrl: process.env.GITHUB_CALLBACK_URL,
        tokenUrl: "https://github.com/login/oauth/access_token",
        scopes: {
          "read:user": "Read user profile",
          "user:email": "Access user email",
        },
      },
    },
  }
);

type Method =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "options"
  | "trace";

type Options = {
  tags: string[];
  method: Method;
  path: string;
  summary: string;
  bodySchema?: any;
  paramsSchema?: any;
  querySchema?: any;
  headersSchema?: any;
  authType?:
    | "bearerAuth"
    | "GoogleOAuth"
    | "GitHubOAuth"
    | [{ [key: string]: string[] }];
  statusCode: number;
  responseDescription: string;
};

export const registerPath = (options: Options) => {
  const {
    tags,
    method,
    path,
    summary,
    bodySchema,
    paramsSchema,
    querySchema,
    headersSchema,
    authType,
    statusCode,
    responseDescription,
  } = options;

  let security: [{ [key: string]: string[] }] | undefined = undefined;

  if (authType) {
    switch (authType) {
      case "bearerAuth":
        security = [{ [bearerAuth.name]: [] }];
        break;
      case "GoogleOAuth":
        security = [{ [googleOAuth.name]: ["profile", "email"] }];
        break;
      case "GitHubOAuth":
        security = [{ [githubOAuth.name]: ["read:user", "user:email"] }];
        break;
    }
  }

  registry.registerPath({
    tags,
    method,
    path,
    summary,
    security,
    request: {
      ...(bodySchema && {
        body: { content: { "application/json": { schema: bodySchema } } },
      }),
      ...(paramsSchema && { params: paramsSchema }),
      ...(querySchema && { query: querySchema }),
      ...(headersSchema && { headers: headersSchema }),
    },
    responses: {
      [statusCode]: {
        description: responseDescription,
      },
    },
  });
};
