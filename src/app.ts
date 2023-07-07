import express, { Express } from "express";
import productRoutes from "./routes/productRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import salesRoutes from "./routes/salesRoutes";

const app: Express = express();
app.use("/product", productRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/sales", salesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  if (PORT === 3000) {
    console.log("true");
  }
  console.log(`server is listening on ${PORT} !!!`);
});
