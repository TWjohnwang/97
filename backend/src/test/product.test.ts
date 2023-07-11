import { expect } from "chai";
import * as product from "../controllers/productController";
import { Status, ProductData } from "../utils/interface";
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

describe("Product Controller", () => {
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
  });
  describe("fetchAll function", () => {
    it("should return BadRequest status for invalid page number", async () => {
      req.query.page = "invalid";
      await product.fetchAll(req, res);
      expect(statusCode).to.equal(Status.BadRequest);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Invalid page number",
      });
    });

    it("should return NotFound status for no data found", async () => {
      req.query.page = "100";
      await product.fetchAll(req, res);
      expect(statusCode).to.equal(Status.NotFound);
      expect(response).to.deep.equal({
        status: "failed",
        message: "No data found",
      });
    });

    it("should return data that has a length less than or equal to 10", async () => {
      req.query.page = "2";

      await product.fetchAll(req, res);

      const result = response as {
        status: string;
        result: ProductData[];
      };
      expect(statusCode).to.equal(Status.Success);
      expect(result.result.length).to.be.lessThan(11);
    });
  });

  describe("fetchByCondition function", () => {
    it("should return BadRequest status for missing properties in the request body", async () => {
      await product.fetchByCondition(req, res);
      expect(statusCode).to.equal(Status.BadRequest);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Missing properties in the request body",
      });
    });

    it("should return NotFound status for no data found", async () => {
      req.body = { name: "non-existent product" };
      await product.fetchByCondition(req, res);
      expect(statusCode).to.equal(Status.NotFound);
      expect(response).to.deep.equal({
        status: "failed",
        message: "No data found",
      });
    });

    it("should return data that matches the request body", async () => {
      req.body = { name: "Laptop" };
      await product.fetchByCondition(req, res);
      expect(statusCode).to.equal(Status.Success);
      expect(response).to.deep.equal({
        status: "success",
        result: [
          {
            name: "Laptop",
            selling_price: 999.99,
            quantity_sold: 100,
            inventory: 100,
            note: "High-performance laptop for professional use",
          },
        ],
      });
    });
  });

  describe("addProduct function", () => {
    it("should return BadRequest status for missing properties in the request body", async () => {
      await product.addProduct(req, res);
      expect(statusCode).to.equal(Status.BadRequest);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Missing properties in the request body",
      });
    });

    it("should return BadRequest status for duplicated name", async () => {
      req.body = {
        name: "Laptop",
        selling_price: 1000,
        quantity_sold: 0,
        inventory: 0,
        note: "New product",
      };
      await product.addProduct(req, res);
      expect(statusCode).to.equal(Status.BadRequest);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Duplicate entry 'Laptop' for key 'product_name_unique'",
      });
    });

    it("should return Success status for new product added", async () => {
      req.body = {
        name: "New Product",
        selling_price: 1000,
        quantity_sold: 0,
        inventory: 0,
        note: "New product",
      };
      await product.addProduct(req, res);
      expect(statusCode).to.equal(Status.Success);
      expect(response).to.deep.equal({
        status: "success",
        message: "Data added successfully",
      });
    });
  });

  describe("updateProduct function", () => {
    it("should return BadRequest status for missing properties in the request body", async () => {
      await product.updateProduct(req, res);
      expect(statusCode).to.equal(Status.BadRequest);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Missing name in the request body",
      });
    });

    it("should return NotFound status for no data updated", async () => {
      req.body = { name: "non-existent product", newName: "new name" };
      await product.updateProduct(req, res);
      expect(statusCode).to.equal(Status.NotFound);
      expect(response).to.deep.equal({
        status: "failed",
        message: "No data updated",
      });
    });

    it("should return BadRequest status for duplicated product name", async () => {
      req.body = { name: "product1", newName: "product2" };
      await product.updateProduct(req, res);
      expect(statusCode).to.equal(Status.BadRequest);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Cannot update duplicated product name",
      });
    });

    it("should return Success status for product updated", async () => {
      req.body = { name: "product1", newName: "new name" };
      await product.updateProduct(req, res);
      expect(statusCode).to.equal(Status.Success);
      expect(response).to.deep.equal({
        status: "success",
        message: "Data updated successfully",
      });
    });
  });

  describe("deleteProduct function", () => {
    it("should return BadRequest status for missing properties in the request body", async () => {
      await product.deleteProduct(req, res);
      expect(statusCode).to.equal(Status.BadRequest);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Missing name in the request body",
      });
    });

    it("should return NotFound status for no data deleted", async () => {
      req.body = { name: "non-existent product" };
      await product.deleteProduct(req, res);
      expect(statusCode).to.equal(Status.NotFound);
      expect(response).to.deep.equal({
        status: "failed",
        message: "No data deleted",
      });
    });

    it("should return BadRequest status for existing references", async () => {
      req.body = { name: "Laptop" };
      await product.deleteProduct(req, res);
      expect(statusCode).to.equal(Status.BadRequest);
      expect(response).to.deep.equal({
        status: "failed",
        message: "Cannot delete product for existing references.",
      });
    });

    it("should return Success status for product deleted", async () => {
      req.body = { name: "product1" };
      await product.deleteProduct(req, res);
      expect(statusCode).to.equal(Status.Success);
      expect(response).to.deep.equal({
        status: "success",
        message: "Data deleted successfully",
      });
    });
  });
});
