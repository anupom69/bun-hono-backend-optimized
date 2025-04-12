import { prisma } from "../utils/prismaClient";

export const leftTimeMsCounter = async () => {
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { id: "cm8o25tal0000z9ixnxdse565" },
    });

    if (!adminProfile || !adminProfile.lastCheckIn) {
      return 0;
    }

    const messages = await prisma.message.findMany();
    if (messages.length === 0) {
      return 0;
    }

    const leastSendAfterMessage = messages.reduce((prev, current) =>
      prev.sendAfter < current.sendAfter ? prev : current
    );

    const leastSendAfter = leastSendAfterMessage.sendAfter;
    const lastCheckInTime = new Date(adminProfile.lastCheckIn).getTime();
    const targetTime = lastCheckInTime + leastSendAfter * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    const timeLeftMs = targetTime - Date.now(); // Convert milliseconds to hours

    return timeLeftMs;
};
