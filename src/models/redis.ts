import { createClient } from "redis";
import { ProductData, PurchaseData, SalesReturnData } from "../utils/interface";

const client = createClient();
// get data from redis
export const getRedisData = async (category: string, page: number) => {
  try {
    await client.connect();
    const value = await client.get(`${category}-${page}`);
    await client.disconnect();
    return value;
  } catch (err) {
    return false;
  }
};

// set data to redis
export const setRedisData = async (
  category: string,
  page: number,
  data: ProductData[] | PurchaseData[] | SalesReturnData[]
) => {
  try {
    await client.connect();
    await client.set(`${category}-${page}`, JSON.stringify(data), {
      EX: 60 * 60,
    });
    await client.disconnect();
  } catch (err) {
    return false;
  }
};
