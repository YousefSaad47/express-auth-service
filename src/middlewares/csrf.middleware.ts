import { Request, RequestHandler } from "express";

import { ForbiddenException } from "@/common/exceptions";

type IsAllowedOriginHandler = (origin: string, req: Request) => boolean;

const secFetchSiteValues = [
  "same-origin",
  "same-site",
  "none",
  "cross-site",
] as const;

type SecFetchSite = (typeof secFetchSiteValues)[number];

const isSecFetchSite = (val: string): val is SecFetchSite => {
  return (secFetchSiteValues as readonly string[]).includes(val);
};

type IsAllowedSecFetchSiteHandler = (
  secFetchSite: SecFetchSite,
  req: Request
) => boolean;

type CSRFOptions = {
  origin?: string | string[] | IsAllowedOriginHandler;
  secFetchSite?: SecFetchSite | SecFetchSite[] | IsAllowedSecFetchSiteHandler;
};

const isSafeMethodRe = /^(GET|HEAD)$/;

const isRequestedByFormElementRe =
  /^\b(application\/x-www-form-urlencoded|multipart\/form-data|text\/plain)\b/i;

export const csrf = (opts: CSRFOptions): RequestHandler => {
  const originHandler: IsAllowedOriginHandler = ((optsOrigin) => {
    if (!optsOrigin) {
      return (origin, req) => origin === req.protocol + "://" + req.get("host");
    } else if (typeof optsOrigin === "string") {
      return (origin) => origin === optsOrigin;
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin);
    }
  })(opts?.origin);

  const isAllowedOrigin = (origin: string | undefined, req: Request) => {
    if (origin === undefined) {
      // denied always when origin header is not present
      return false;
    }
    return originHandler(origin, req);
  };

  const secFetchSiteHandler: IsAllowedSecFetchSiteHandler = ((
    optsSecFetchSite
  ) => {
    if (!optsSecFetchSite) {
      // Default: only allow same-origin
      return (secFetchSite) => secFetchSite === "same-origin";
    } else if (typeof optsSecFetchSite === "string") {
      return (secFetchSite) => secFetchSite === optsSecFetchSite;
    } else if (typeof optsSecFetchSite === "function") {
      return optsSecFetchSite;
    } else {
      return (secFetchSite) => optsSecFetchSite.includes(secFetchSite);
    }
  })(opts?.secFetchSite);

  const isAllowedSecFetchSite = (
    secFetchSite: string | undefined,
    req: Request
  ) => {
    if (secFetchSite === undefined) {
      // denied always when sec-fetch-site header is not present
      return false;
    }
    // type guard to check if the value is a valid SecFetchSite
    if (!isSecFetchSite(secFetchSite)) {
      return false;
    }
    return secFetchSiteHandler(secFetchSite, req);
  };

  return (req, _res, next) => {
    if (
      !isSafeMethodRe.test(req.method) &&
      isRequestedByFormElementRe.test(
        req.header("content-type") || "text/plain"
      ) &&
      !isAllowedSecFetchSite(req.header("sec-fetch-site"), req) &&
      !isAllowedOrigin(req.header("origin"), req)
    ) {
      throw new ForbiddenException();
    }

    next();
  };
};
