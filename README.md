# Backend for Whatsapp Message Scheduling App

**Note**: You will need a Redis server to run this app. You can host one from [Upstash](https://upstash.com/) for free.

## Setup

1. Install dependencies:

```sh
bun install
```

2. Create an `.env` file:

```env
PORT=3000
DATABASE_URL="file:./dev.db" # Database URL
REDIS_REST_URL="<YOUR_REDIS_URL>" # Redis URL
USERNAME=user # Set your desired username that will be used in frontend
PASSWORD=pass # Set your desired password that will be used in frontend
```

3. Run the app:

```sh
bun run start
```

4. **Scan the QR code from your whatsapp app (mobile) visible in the terminal.**

5. You should get some messages in your own whatsapp number you registered with in your phone like `Backend Server Started successfully! 🚀`.

6. (**Optional**) You can now connect your frontend with it. Here's one I used: [Frontend](https://github.com/anupom69/bun-hono-frontend-nextjs)