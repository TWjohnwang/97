import express, { Router } from "express";
import bodyParser from "body-parser";
import {
  fetchAll,
  fetchByCondition,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { dataTypeCheck, isPositiveInteger } from "../utils/ValidateInput";

const productRoutes: Router = express.Router();
productRoutes.use(bodyParser.json());

// fetch products by specifying page number
productRoutes.get("/", fetchAll);

// fetch products by specifying conditions
productRoutes.post("/", dataTypeCheck, isPositiveInteger, fetchByCondition);

// add a product
productRoutes.post("/newproduct", dataTypeCheck, isPositiveInteger, addProduct);

// update a product
productRoutes.put("/", dataTypeCheck, isPositiveInteger, updateProduct);

// delete a product
productRoutes.delete("/", dataTypeCheck, deleteProduct);

export default productRoutes;
