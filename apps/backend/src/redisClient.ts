import Redis from 'ioredis';

const redis = new Redis({
    host: 'localhost',
    port: 6380,
    password: process.env.REDIS_PASSWORD,
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export default redis;