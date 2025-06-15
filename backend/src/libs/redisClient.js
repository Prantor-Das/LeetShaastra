import { createClient } from 'redis';

const redisPort = process.env.REDIS_PORT;

const redisClient = createClient({
  username: 'default',
  password: process.env.REDIS_PASS,
  socket: {
    host: process.env.REDIS_HOST,
    port: redisPort,
  },
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// Don't connect here — connect in your main server file
export default redisClient;