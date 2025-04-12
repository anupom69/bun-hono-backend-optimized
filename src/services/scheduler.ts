import { leftTimeMsCounter } from "../functions/leftTimeMsCounter";
import { messageQueue } from "../queues/messageQueue";
import { daysToMs } from "../utils/daysToMs";
import { prisma } from "../utils/prismaClient";
// import { getJobsList } from "../workers/messageWorker";
import { handleError } from "../utils/errorHandler";

export async function scheduleMessages() {
  try {
    // Clear existing jobs
    await messageQueue.obliterate({ force: true }); // More efficient than removing jobs one by one

    const [messages, timeLeft] = await Promise.all([
      prisma.message.findMany(),
      leftTimeMsCounter(),
      prisma.adminProfile.update({
        where: { id: "cm8o25tal0000z9ixnxdse565" },
        data: { lastCheckIn: new Date() },
      }),
    ]);

    // Schedule all messages in parallel
    await Promise.all([
      ...messages.map((message) => {
        const jobId = `message-${message.id}`;
        const sendAfterMs = daysToMs(message.sendAfter);
        return messageQueue.add(
          jobId,
          { content: message.content, sendToPhone: message.sendToPhone },
          {
            jobId,
            delay: sendAfterMs,
          }
        );
      }),
      // Schedule reminder message
      messageQueue.add(
        "message-reschedule",
        {
          content:
            "You have 3.5 hours left to reschedule messages or I think you are dead",
          sendToPhone: "8801884510919",
        },
        {
          jobId: "message-reschedule",
          delay: timeLeft - 3.5 * 3600 * 1000,
        }
      ),
      messageQueue.add(
        "message-delay-testing",
        {
          content:
            "Worker is running [Should send after 10 seconds]",
          sendToPhone: "8801884510919",
        },
        {
          jobId: "message-delay-testing",
          delay: daysToMs(0.000115741),
        }
      ),
    ]);

  } catch (error) {
    handleError(error, "scheduling messages");
  }
}
