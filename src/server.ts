import { serve } from "bun";
import { app } from "./app";
import { client, sendMessage } from "./services/w-web";
import { scheduleMessages } from "./services/scheduler";
import * as qrcode from "qrcode-terminal";
import { Worker } from "bullmq";
import { redisConfig } from "./config/redis";

const port = Bun.env.PORT || 3000;

client.on("qr", (qr) => {
  console.log("[QR RECEIVED]");
  qrcode.generate(qr, { small: true }, (code: string) => {
    console.log(code);
  });
});

client.on("ready", async () => {
  console.log("[CLIENT]: WhatsApp client is ready.");
  await startServer();
});

client.on("disconnected", (reason) => {
  console.warn("[CLIENT]: Disconnected:", reason);
});

client.on("error", (error) => {
  console.error("[CLIENT ERROR]:", error);
});

client.initialize();

async function startServer() {
  await sendMessage("8801884510919", "Backend Server Started successfully! 🚀");
  await scheduleMessages();
  const worker = new Worker(
    "messageQueue",
    async (job) => {
      try {
        await sendMessage(job.data.sendToPhone, job.data.content);
      } catch (error) {
        console.error("[WORKER ERROR]: Failed to send message", error);
      }
    },
    { connection: redisConfig, concurrency: 1 }
  );

  worker.on("ready", () => {
    console.log("[WORKER]: Ready!");
  });

  worker.on("error", (error) => {
    console.error("[WORKER ERROR]:", error);
  });
  console.log(`[SERVER]: Running on http://localhost:${port}`);
}

serve({
  fetch: app.fetch,
  port: Number(port),
});
