/* eslint-disable @typescript-eslint/no-explicit-any */

export const encodeCursor = (val: Record<string, any>) => {
  return Buffer.from(JSON.stringify(val)).toString("base64");
};

export const decodeCursor = (cursor: string) => {
  return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
};
