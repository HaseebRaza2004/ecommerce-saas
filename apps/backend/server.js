import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { redisClient } from "./src/config/redis.client.js";

const startServer = () => {
  try {
    app.listen(env.PORT, () => {
      console.log(
        `✅ Master Backend is running on port ${env.PORT} in ${env.NODE_ENV} mode`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1); // Agar server fail ho toh cleanly exit kar jaye
  }
};

startServer();