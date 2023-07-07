import express, { Router } from "express";
import bodyParser from "body-parser";
import { salesDataTypeCheck } from "../utils/ValidateInput";
import { fetchAll, addSales } from "../controllers/salesController";

const salesRoutes: Router = express.Router();

salesRoutes.use(bodyParser.json());

salesRoutes.get("/", fetchAll);

salesRoutes.post("/newsales", salesDataTypeCheck, addSales);

export default salesRoutes;
