// This file is not used. It's in the repo for future reference
import { Worker } from "bullmq";
import { redisConfig } from "../config/redis";
import { client, sendMessage } from "../services/w-web";
import { messageQueue } from "../queues/messageQueue";
import { handleError } from "../utils/errorHandler";
client.on("ready", async () => {
  console.log("Client is ready!");
  startWorker();
});
client.initialize();
const getJobsList = async () => {
  try {
    const jobs = await messageQueue.getJobs();
    return jobs.map(({ data, timestamp }) => ({ data, timestamp }));
  } catch (error) {
    handleError(error, "fetching jobs");
    return [];
  }
};

const startWorker = async () => {
  const worker = new Worker(
    "messageQueue",
    async (job) => {
      try {
        await sendMessage(job.data.sendToPhone, job.data.content);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    { connection: redisConfig, concurrency: 1 }
  );

  worker.on("error", (error) => {
    console.error("Worker error:", error);
  });

  worker.on("ready", () => {
    console.log("Worker is ready!");
  });
};

export { getJobsList };
