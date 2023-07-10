import BigNumber from "bignumber.js";
import PurchaseClass from "../models/purchaseModel";
import { Request, Response } from "express";
import { Status, PurchaseData } from "../utils/interface";

export async function fetchAll(req: Request, res: Response) {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  if (isNaN(page) || page === 0) {
    return res.status(Status.BadRequest).json({
      status: "failed",
      message: "Invalid page number",
    });
  }
  const result = await PurchaseClass.fetchAllPurchase(page);
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
      break;
  }
}

export async function fetchByCondition(req: Request, res: Response) {
  const requestBody: Partial<PurchaseData> = req.body;
  const purchase_price = requestBody.purchase_price
    ? new BigNumber(requestBody.purchase_price).toFixed(6)
    : undefined;
  const purchase = new PurchaseClass(
    requestBody.name,
    purchase_price,
    requestBody.quantity_purchased
  );
  const result = await purchase.fetchPurchaseByCondition();
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

export async function addPurchase(req: Request, res: Response) {
  const requestBody: Partial<PurchaseData> = req.body;
  const purchase = new PurchaseClass(
    requestBody.name,
    requestBody.purchase_price,
    requestBody.quantity_purchased
  );

  const result: Status = await purchase.addPurchase();
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
        message: `Product with name ${purchase.name} not found`,
      });
      break;
    default:
      res.status(Status.Success).json({
        status: "success",
        message: "Purchase record added successfully",
      });
  }
}
