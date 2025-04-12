import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";

export const messageQueue = new Queue("messageQueue", {
  connection: redisConfig,
});