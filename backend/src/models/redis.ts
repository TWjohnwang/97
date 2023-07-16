import { createClient } from "redis";
// import { promisify } from 'util';
import { ProductData, PurchaseData, SalesReturnData } from "../utils/interface";

// get data from redis
export const getRedisData = async (category: string, page: number) => {
  const client = createClient();
  try {
    await client.connect();
    const value = await client.get(`${category}-${page}`);
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
  const client = createClient();
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

export const deleteAllRedisData = async () => {
  const client = createClient();
  await client.connect();
  const keys = await client.keys('*');
  for (const key of keys) {
    await client.del(key);
  } 
};