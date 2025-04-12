import { Hono } from "hono";
import { scheduleMessages } from "../services/scheduler";
import { prisma } from "../utils/prismaClient";
import { basicAuth } from "hono/basic-auth";
import { sendMessage } from "../services/w-web";

const messagesRoutes = new Hono().use(
  basicAuth({
    username: Bun.env.USERNAME || "user",
    password: Bun.env.PASSWORD || "pass",
  })
);

messagesRoutes.get("/reschedule", async (c) => {
  try {
    await scheduleMessages();
    return c.json({ message: "Messages rescheduled successfully" }, 200);
  } catch (error) {
    console.error("Error rescheduling messages:", error);
    return c.json({ message: "Failed to reschedule messages" }, 500);
  }
});

messagesRoutes.get("/all", async (c) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: {
        sendAfter: "asc",
      },
      include: {
        sendTo: {
          select: {
            name: true,
          },
        },
      },
    });
    return c.json(messages, 200);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ message: "Failed to fetch messages" }, 500);
  }
});

messagesRoutes.post("/create-one", async (c) => {
  try {
    const { content, sendToPhone, sendAfter } = await c.req.json();
    if (!content || !sendToPhone || !sendAfter) {
      return c.json({ message: "Missing required fields" }, 400);
    }
    if (sendAfter < 1) {
      return c.json(
        { message: "Send after time must be at least after 1 day" },
        400
      );
    }
    await prisma.message.create({
      data: {
        content,
        sendToPhone,
        sendAfter,
      },
    });
    await scheduleMessages();
    return c.json({ message: "Message created successfully" }, 200);
  } catch (error) {
    console.error("Error creating message:", error);
    return c.json({ message: "Failed to create message" }, 500);
  }
});

messagesRoutes.get("/read-one/:id", async (c) => {
  try {
    const id = await c.req.param("id");
    const data = await prisma.message.findUnique({
      where: {
        id,
      },
    });
    return c.json(data, 200);
  } catch (error) {
    console.error("Error fetching message:", error);
    return c.json({ message: "Failed to fetch message" }, 500);
  }
});

messagesRoutes.post("/update-one/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { content, sendToPhone, sendAfter } = await c.req.json();
    await prisma.message.update({
      where: { id: id },
      data: {
        content,
        sendToPhone,
        sendAfter,
      },
    });
    await scheduleMessages();
    return c.json({ message: "Message updated successfully" }, 200);
  } catch (error) {
    console.error("Error updating message:", error);
    return c.json({ message: "Failed to update message" }, 500);
  }
});

messagesRoutes.post("/delete-one/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await prisma.message.delete({
      where: { id: id },
    });
    await scheduleMessages();
    return c.json({ message: "Message deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting message:", error);
    return c.json({ message: "Failed to delete message" }, 500);
  }
});

messagesRoutes.post("/send-instant", async (c) => {
  try {
    const { content, sendToPhone } = await c.req.json();
    if (!content || !sendToPhone) {
      return c.json({ message: "Missing required fields" }, 400);
    }
    await sendMessage(sendToPhone, content);
    return c.json({ message: "Message sent successfully" }, 200);
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ message: "Failed to send message" }, 500);
  }
});

export { messagesRoutes };
