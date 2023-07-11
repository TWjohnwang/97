import express, { Router } from "express";
import bodyParser from "body-parser";
import { dataTypeCheck } from "../utils/ValidateInput";
import {
  fetchAll,
  fetchByCondition,
  addPurchase,
} from "../controllers/purchaseController";

const purchaseRoutes: Router = express.Router();
purchaseRoutes.use(bodyParser.json());

// fetch all purchase records
purchaseRoutes.get("/", fetchAll);

// fetch purchase records by specifying conditions
purchaseRoutes.post("/", dataTypeCheck, fetchByCondition);

// add a purchase record
purchaseRoutes.post("/newpurchase", dataTypeCheck, addPurchase);

export default purchaseRoutes;
