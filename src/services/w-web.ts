import { Client, LocalAuth } from "whatsapp-web.js";

const client = new Client({
  authStrategy: new LocalAuth(),
});

const sendMessage = async (phone: string, message: string) => {
  // client.sendMessage(phone, message);
  try {
    console.log(`Sending message: ${message.slice(0, 100)}... to ${phone}`);
    client.sendMessage(`${phone}@c.us`, message);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export { sendMessage, client };
