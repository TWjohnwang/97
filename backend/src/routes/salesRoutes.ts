import express, { Router } from "express";
import bodyParser from "body-parser";
import { salesDataTypeCheck, dataTypeCheck } from "../utils/ValidateInput";
import { fetchAll, fetchByCondition, addSales } from "../controllers/salesController";
import cors from "cors";

const salesRoutes: Router = express.Router();

// 設定 CORS 選項
const corsOptions = {
    origin: 'http://localhost:9528', // 允許的來源網域
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允許的 HTTP 方法
    credentials: true // 允許傳送認證資訊（如 Cookies）
  };
  
salesRoutes.use(cors(corsOptions));

salesRoutes.use(bodyParser.json());

salesRoutes.get("/", fetchAll);

salesRoutes.post("/", dataTypeCheck, fetchByCondition);

salesRoutes.post("/newsales", salesDataTypeCheck, addSales);

export default salesRoutes;
