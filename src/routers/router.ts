import express from "express";

const router = express.Router();
// get a product
router.get("/", (req, res) => {
  res.send("The server is working!");
});

// add a product
router.post("/", (req, res) => {});

// update a product
router.put("/", (req, res) => {});

// delete a product
router.delete("/", (req, res) => {});

export default router;
