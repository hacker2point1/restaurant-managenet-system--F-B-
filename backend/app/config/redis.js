const { default: chalk } = require("chalk");
const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

// Redis error
redisClient.on("error", (error) => {
  console.error("Redis Error:", error);
});

// Redis connected
redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

// Redis ready
redisClient.on("ready", () => {
  console.log(chalk.bgGreen("Redis connected successfully!"));
});

// Redis reconnecting
redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

// Connect Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error(chalk.red("Redis Connection Error:", error));
  }
};

module.exports = {
  redisClient,
  connectRedis,
};