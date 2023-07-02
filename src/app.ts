import express, { Express } from "express";
import router from "./routers/router";

const app: Express = express();
app.use(router);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  if (PORT === 3000) {
    console.log("true");
  }
  console.log(`server is listening on ${PORT} !!!`);
});
