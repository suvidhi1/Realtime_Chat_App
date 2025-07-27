//redis.js
const redis = require('redis');

const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },
    password: process.env.REDIS_PASSWORD || undefined
});

client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

client.on('connect', () => {
    console.log('✅ Connected to Redis');
});

client.on('ready', () => {
    console.log('🚀 Redis client ready');
});

const connectRedis = async () => {
    try {
        if (!client.isOpen) {
            await client.connect();
        }
        console.log('✅ Redis connection established');
    } catch (error) {
        console.error('❌ Redis connection error:', error);
        // Don't exit process, let app continue without Redis
    }
};

module.exports = { client, connectRedis };