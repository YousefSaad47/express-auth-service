/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request } from "express";

import { regexes } from "zod";

const exists = (val: any) => {
  return val != null;
};

const ip = (val: any): val is string => {
  return (exists(val) && regexes.ipv4.test(val)) || regexes.ipv6.test(val);
};

const getClientIpFromXForwardedFor = (val: any) => {
  if (!exists(val)) {
    return null;
  }

  if (!(typeof val === "string")) {
    throw new TypeError(`Expected a string, got "${typeof val}"`);
  }

  const forwardedIps = val.split(",").map((e) => {
    const ip = e.trim();
    if (ip.includes(":")) {
      const splitted = ip.split(":");
      // make sure we only use this if it's ipv4 (ip:port)
      if (splitted.length === 2) {
        return splitted[0];
      }
    }
    return ip;
  });

  for (let i = 0; i < forwardedIps.length; i++) {
    if (ip(forwardedIps[i])) {
      return forwardedIps[i];
    }
  }

  // If no value in the split list is an ip, return null
  return null;
};

export const getClientIp = (req: Request) => {
  const ipHeaders = [
    "x-client-ip",
    "cf-connecting-ip",
    "Cf-Pseudo-IPv4",
    "do-connecting-ip",
    "fastly-client-ip",
    "true-client-ip",
    "x-real-ip",
    "x-cluster-client-ip",
    "x-forwarded",
    "forwarded-for",
    "forwarded",
    "x-appengine-user-ip",
  ];

  if (req.headers) {
    const xForwardedFor = getClientIpFromXForwardedFor(
      req.headers["x-forwarded-for"]
    );

    if (ip(xForwardedFor)) {
      return xForwardedFor;
    }

    for (const h of ipHeaders) {
      if (ip(req.headers[h])) {
        return req.headers[h];
      }
    }
  }

  if (exists(req.socket) && ip(req.socket.remoteAddress)) {
    return req.socket.remoteAddress;
  }

  return null;
};
