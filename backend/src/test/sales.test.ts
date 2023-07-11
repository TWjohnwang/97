import { expect } from "chai";
import * as sales from "../controllers/salesController";
import { Status, SalesData } from "../utils/interface";
import { Request, Response } from "express";
import db from "../models/database/config";
import { spawnSync } from "child_process";
import { describe } from "mocha";

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

describe("Sales Controller", () => {
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
    db.destroy();
  });

  describe("fetchAll function", () => {
    it("should return BadRequest status for invalid page number", async () => {
      req.query.page = "invalid";
      await sales.fetchAll(req, res);
      expect(statusCode).to.equal(Status.BadRequest);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Invalid page number",
      });
    });

    it("should return NotFound status for no data found", async () => {
      req.query.page = "100";
      await sales.fetchAll(req, res);
      expect(statusCode).to.equal(Status.NotFound);
      expect(response).to.deep.equal({
        status: "failed",
        message: "No data found",
      });
    });

    it("should return data that has a length less than or equal to 10", async () => {
      req.query.page = "1";

      await sales.fetchAll(req, res);

      const result = response as {
        status: string;
        result: { [key: string]: SalesData[] };
      };
      expect(statusCode).to.equal(Status.Success);
      expect(Object.keys(result.result).length).to.be.lessThan(11);
    });
  });
  describe("addSales function", () => {
    it("should return NotFound status for no product found", async () => {
      req.body = [{ name: "non-existent product", quantity: 10 }];
      await sales.addSales(req, res);
      expect(statusCode).to.equal(Status.NotFound);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Product not found",
      });
    });

    it("should return BadRequest status for not enough product", async () => {
      req.body = [{ name: "Laptop", quantity: 1000 }];
      await sales.addSales(req, res);
      expect(statusCode).to.equal(Status.BadRequest);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Inventory is not enough",
      });
    });

    it("should return Success status for new sales added", async () => {
      req.body = [
        {
          name: "Smartphone",
          quantity: 2,
        },
        {
          name: "Laptop",
          quantity: 10,
        },
      ];

      await sales.addSales(req, res);

      expect(statusCode).to.equal(Status.Success);
      expect(response).to.deep.equal({
        status: "success",
        message: "New sales added",
      });
    });
  });
});
