import BigNumber from "bignumber.js";
import ProductClass from "../models/productModel";
import { Request, Response } from "express";
import { ProductData, Status } from "../utils/interface";
import { getRedisData, setRedisData, deleteAllRedisData } from "../models/redis";

interface UpdateProduct extends Partial<ProductData> {
  newName?: string;
}

type DeleteProduct = Pick<ProductData, "name">;

export async function fetchAll(req: Request, res: Response) {
  const page = req.query.page ? parseInt(<string>req.query.page) : 1;
  if (isNaN(page) || page === 0) {
    return res.status(Status.BadRequest).json({
      status: "failed",
      message: "Invalid page number",
    });
  }
  const redisResult = await getRedisData("product", page);
  if (redisResult) {
    const data = JSON.parse(redisResult as unknown as string);
    return res.status(Status.Success).json({
      status: "success",
      result: data,
    });
  }
  const result = await ProductClass.fetchAllProduct(page);
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
      await setRedisData("product", page, result);
      return res.status(Status.Success).json({
        status: "success",
        result,
      });
  }
}

export async function fetchByCondition(req: Request, res: Response) {
  const requestBody: Partial<ProductData> = req.body;
  if (Object.keys(requestBody).length === 0) {
    return res.status(Status.BadRequest).json({
      status: "failed",
      message: "Missing properties in the request body",
    });
  }
  const selling_price = requestBody.selling_price
    ? new BigNumber(requestBody.selling_price).toFixed(6)
    : undefined;

  const product = new ProductClass(
    requestBody.name,
    selling_price,
    requestBody.quantity_sold,
    requestBody.inventory
  );

  const result = await product.fetchProductByCondition();
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

export async function addProduct(req: Request, res: Response) {
  const requestBody: ProductData = req.body;
  if (
    !requestBody.name ||
    requestBody.selling_price === undefined ||
    requestBody.quantity_sold === undefined ||
    requestBody.inventory === undefined
  ) {
    return res.status(Status.BadRequest).json({
      status: "failed",
      message: "Missing properties in the request body",
    });
  }
  const product = new ProductClass(
    requestBody.name,
    requestBody.selling_price,
    requestBody.quantity_sold,
    requestBody.inventory,
    requestBody.note
  );
  const result = await product.addProduct();
  switch (result.status) {
    case Status.InternalServerError:
      res.status(Status.InternalServerError).json({
        status: "failed",
        message: "Internal server error",
      });
      break;
    case Status.BadRequest:
      res.status(Status.BadRequest).json({
        status: "failed",
        message: result.message,
      });
      break;
    default:
      await deleteAllRedisData();
      res.status(Status.Success).json({
        status: "success",
        result: "Data added successfully",
      });
      break;
  }
}

export async function updateProduct(req: Request, res: Response) {
  const requestBody: UpdateProduct = req.body;
  if (!requestBody.name) {
    return res.status(Status.BadRequest).json({
      status: "failed",
      message: "Missing name in the request body",
    });
  }

  if (
    Object.keys(requestBody).length < 2 ||
    (!requestBody.newName &&
      !requestBody.selling_price &&
      !requestBody.quantity_sold &&
      !requestBody.inventory &&
      !requestBody.note)
  ) {
    return res.status(Status.BadRequest).json({
      status: "failed",
      message: "Missing properties in the request body",
    });
  }

  const product = new ProductClass(
    requestBody.name,
    requestBody.selling_price,
    requestBody.quantity_sold,
    requestBody.inventory,
    requestBody.note
  );
  const result = await product.updateProduct(requestBody.newName);
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
        message: "No data updated",
      });
      break;
    case Status.BadRequest:
      res.status(Status.BadRequest).json({
        status: "failed",
        message: "Cannot update duplicated product name",
      });
      break;
    default:
      await deleteAllRedisData();
      res.status(Status.Success).json({
        status: "success",
        result: "Data updated successfully",
      });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  const requestBody: DeleteProduct = req.body;
  if (!requestBody.name) {
    return res.status(Status.BadRequest).json({
      status: "failed",
      message: "Missing name in the request body",
    });
  }
  const product = new ProductClass(requestBody.name);
  const result: Status = await product.deleteProduct();
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
        message: "No data deleted",
      });
      break;
    case Status.BadRequest:
      res.status(Status.BadRequest).json({
        status: "failed",
        message: "Cannot delete product for existing references.",
      });
      break;
    default:
      await deleteAllRedisData();
      res.status(Status.Success).json({
        status: "success",
        result: "Data deleted successfully",
      });
  }
}
