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
import cors from "cors";

const productRoutes: Router = express.Router();
productRoutes.use(bodyParser.json());

// 設定 CORS 選項
const corsOptions = {
  origin: 'http://localhost:9528', // 允許的來源網域
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允許的 HTTP 方法
  credentials: true // 允許傳送認證資訊（如 Cookies）
};

productRoutes.use(cors(corsOptions));

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
