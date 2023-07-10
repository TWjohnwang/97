import { expect } from "chai";
import * as purchase from "../controllers/purchaseController";
import { Status, PurchaseData } from "../utils/interface";
import { Request, Response } from "express";
import db from "../models/database/config";
import { spawnSync } from "child_process";

let statusCode: unknown, response: unknown;

const req = {
  query: {
    page: undefined,
  },
} as unknown as Request;

const res = {
  status: (code: unknown) => {
    statusCode = code;
    return res;
  },
  json: (res: unknown) => (response = res),
} as unknown as Response;

describe("Purchase Controller", () => {
  // create seed data before running the tests
  beforeEach(async function () {
    req.body = {};
    this.timeout(5000);
    spawnSync("npm", ["run", "knex", "seed:run"]);
  });
  // delete seed data after running the tests
  after(async () => {
    await db("purchase_records").del();
    await db("sales_detail").del();
    await db("sales_records").del();
    await db("product").del();
    // db.destroy();
  });
  describe("fetchAll function", () => {
    it("should return BadRequest status for invalid page number", async () => {
      req.query.page = "invalid";
      await purchase.fetchAll(req, res);
      expect(statusCode).to.equal(Status.BadRequest);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Invalid page number",
      });
    });

    it("should return NotFound status for no data found", async () => {
      req.query.page = "100";
      await purchase.fetchAll(req, res);
      expect(statusCode).to.equal(Status.NotFound);
      expect(response).to.deep.equal({
        status: "failed",
        message: "No data found",
      });
    });

    it("should return data that has a length less than or equal to 10", async () => {
      req.query.page = "1";
      await purchase.fetchAll(req, res);
      const result = response as { status: string; result: PurchaseData[] };
      expect(statusCode).to.equal(Status.Success);
      expect(result.result.length).to.be.lessThan(11);
    });
  });

  describe("fetchByCondition function", () => {
    it("should return NotFound status for no data found", async () => {
      req.body = {
        name: "invalid",
      };
      await purchase.fetchByCondition(req, res);
      expect(statusCode).to.equal(Status.NotFound);
      expect(response).to.deep.equal({
        status: "failed",
        message: "No data found",
      });
    });

    it("should return data that matches the request body", async () => {
      req.body = { name: "Laptop" };
      await purchase.fetchByCondition(req, res);
      const result = response as {
        status: string;
        result: PurchaseData[];
      };
      expect(statusCode).to.equal(Status.Success);
      expect(result).to.have.property("status", "success");
      expect(result.result[0]).to.have.property("name", "Laptop");
      expect(result.result[0]).to.have.property("purchase_price", 800);
      expect(result.result[0]).to.have.deep.property("quantity_purchased", 150);
    });
  });

  describe("addPurchase function", () => {
    it("should return BadRequest status for invalid request body", async () => {
      req.body = {
        name: "invalid",
      };
      await purchase.addPurchase(req, res);
      expect(statusCode).to.equal(Status.NotFound);
      expect(response).to.deep.equal({
        status: "failed",
        message: `Product with name ${req.body.name} not found`,
      });
    });

    it("should return Success status for new purchase added", async () => {
      req.body = {
        name: "Laptop",
        purchase_price: 800,
        quantity_purchased: 150,
      };
      await purchase.addPurchase(req, res);
      expect(statusCode).to.equal(Status.Success);
      expect(response).to.deep.equal({
        status: "success",
        message: "Purchase record added successfully",
      });
    });
  });
});
