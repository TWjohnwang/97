import { Request, Response, NextFunction } from "express";
import { ProductData, SalesData, Purchase_records } from "./interface";

export const dataTypeCheck = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestBody: Partial<ProductData> | Partial<Purchase_records> =
    req.body;
  if (
    ("name" in requestBody && typeof requestBody.name !== "string") ||
    ("selling_price" in requestBody &&
      typeof requestBody.selling_price !== "number") ||
    ("quantity_sold" in requestBody &&
      !Number.isInteger(requestBody.quantity_sold)) ||
    ("inventory" in requestBody && !Number.isInteger(requestBody.inventory)) ||
    ("purchase_price" in requestBody &&
      typeof requestBody.purchase_price !== "number") ||
    ("quantity_purchased" in requestBody &&
      !Number.isInteger(requestBody.quantity_purchased))
  ) {
    return res.status(400).json({
      status: "failed",
      message: "Invalid data type",
    });
  }
  next();
};

export const isPositiveInteger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestBody: Partial<ProductData> | Partial<Purchase_records> =
    req.body;
  for (const [key, value] of Object.entries(requestBody)) {
    if (typeof value === "number" && value < 0) {
      return res.status(400).json({
        status: "failed",
        message: `${key} cannot be a negative number`,
      });
    }
  }
  next();
};

export const salesDataTypeCheck = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestBody: SalesData[] = req.body;
  for (const product of requestBody) {
    if (
      typeof product.name !== "string" ||
      !Number.isInteger(product.quantity)
    ) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid data type",
      });
    }
  }
  next();
};
