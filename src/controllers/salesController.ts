import { Request, Response } from "express";
import SalesClass from "../models/salesModel";
import { Status, SalesData } from "../utils/interface";

export async function fetchAll(req: Request, res: Response) {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  if (isNaN(page) || page === 0) {
    return res.status(Status.BadRequest).json({
      status: "failed",
      message: "Invalid page number",
    });
  }
  const result = await SalesClass.fetchAllSales(page);
  switch (result) {
    case false:
      res.status(Status.InternalServerError).json({
        status: "failed",
        message: "Internal server error",
      });
      break;
    case 0:
      res.status(Status.NotFound).json({
        status: "failed",
        message: "No data found",
      });
      break;
    default:
      res.status(Status.Success).json({
        status: "success",
        result,
      });
  }
}

export async function addSales(req: Request, res: Response) {
  const requestBody: SalesData[] = req.body;
  const sales = new SalesClass(requestBody);
  const result = await sales.addSales();
  switch (result) {
    case Status.InternalServerError:
      res.status(Status.InternalServerError).json({
        status: "failed",
        message: "Internal server error",
      });
      break;
    case Status.NotFound:
      res.status(Status.NotFound).json({
        status: "failed",
        message: "Product not found",
      });
      break;
    case Status.BadRequest:
      res.status(Status.BadRequest).json({
        status: "failed",
        message: "Inventory is not enough",
      });
      break;
    default:
      res.status(Status.Success).json({
        status: "success",
        message: "New sales added",
      });
  }
}
