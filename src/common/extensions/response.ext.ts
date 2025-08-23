import { Request, RequestHandler } from "express";

import { HttpStatus } from "@/common/enums";

const responseMeta = (req: Request) => ({
  request_id: req.id,
  timestamp: new Date().toISOString(),
});

export const responseExtension: RequestHandler = (req, res, next) => {
  res.ok = (data: unknown, { message = "Request successful" } = {}) => {
    res.status(HttpStatus.OK).json({
      status: "success",
      status_code: HttpStatus.OK,
      message,
      data,
      meta: responseMeta(req),
    });
  };

  res.created = (
    data: unknown,
    { message = "Resource created successfully" } = {}
  ) => {
    res.status(HttpStatus.CREATED).json({
      status: "success",
      status_code: HttpStatus.CREATED,
      message,
      data,
      meta: responseMeta(req),
    });
  };

  res.noContent = () => {
    res.status(HttpStatus.NO_CONTENT).send();
  };

  res.paginated = (
    data: unknown,
    { message = "Request successful", type, pagination }
  ) => {
    let paginationMeta;

    if (type === "page") {
      const { page, per_page, total_items } = pagination;

      const total_pages = Math.ceil(total_items / per_page);
      const has_next_page = page < total_pages;
      const has_prev_page = page > 1;

      paginationMeta = {
        ...pagination,
        total_pages,
        has_next_page,
        has_prev_page,
      };
    } else {
      paginationMeta = pagination;
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      status_code: HttpStatus.OK,
      message,
      data: {
        items: data,
        pagination: paginationMeta,
      },
      meta: responseMeta(req),
    });
  };

  res.success = (
    data: unknown,
    { message = "Request successful", statusCode = HttpStatus.OK } = {}
  ) => {
    res.status(statusCode).json({
      status: "success",
      status_code: statusCode,
      message,
      data,
      meta: responseMeta(req),
    });
  };

  next();
};
