import { Context, Hono } from "hono";
import { messagesRoutes, peopleRoutes } from "./routes";
import { logger } from "hono/logger";
import { prisma } from "./utils/prismaClient";
const app = new Hono();

app.use(logger());

// Register routes
app.route("/messages", messagesRoutes);
app.route("/people", peopleRoutes);

app.get("/", (c: Context) => {
  return c.json({ message: "Backend Server is running !!!" }, 200);
});

app.get("/time-left", async (c: Context) => {
  const adminProfile = await prisma.adminProfile.findUnique({
    where: { id: "cm8o25tal0000z9ixnxdse565" },
  });

  if (!adminProfile || !adminProfile.lastCheckIn) {
    return c.json(
      { message: "Admin profile not found or missing last check-in" },
      404
    );
  }

  const messages = await prisma.message.findMany();
  if (messages.length === 0) {
    return c.json({ message: "No messages found" }, 404);
  }

  const leastSendAfterMessage = messages.reduce((prev, current) =>
    prev.sendAfter < current.sendAfter ? prev : current
  );

  const leastSendAfter = leastSendAfterMessage.sendAfter;
  const lastCheckInTime = new Date(adminProfile.lastCheckIn).getTime();
  const targetTime = lastCheckInTime + leastSendAfter * 24 * 60 * 60 * 1000; // Convert days to milliseconds

  const timeLeftMs = targetTime - Date.now();
  const timeLeftHours = timeLeftMs / (1000 * 60 * 60); // Convert milliseconds to hours

  return c.json({ timeLeft: timeLeftHours.toFixed(2) }, 200);
});

export { app };
