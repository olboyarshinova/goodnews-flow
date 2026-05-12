import express from 'express';
import cors from 'cors';
import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import {makeExecutableSchema} from '@graphql-tools/schema';
import mongoose from 'mongoose';
import {createClient} from 'redis';
import dotenv from 'dotenv';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {readFileSync} from "fs";
import {newsResolvers} from './graphql/resolvers/news';

dotenv.config();

async function connectInfrastructure() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err);
        process.exit(1);
    }

    try {
        const redisClient = createClient({ url: process.env.REDIS_URL });
        redisClient.on('error', err => console.error('❌ Redis error:', err));
        await redisClient.connect();
        console.log('✅ Redis connected');
        return redisClient;
    } catch (err) {
        console.error('❌ Redis connection failed:', err);
        process.exit(1);
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typeDefs = readFileSync(join(__dirname, 'graphql/schema.graphql'), 'utf-8');

const resolvers = {
    Query: {
        hello: () => 'Good News API is running! 🌍',
        ping: () => 'pong',
        ...newsResolvers.Query,
    },
    News: newsResolvers.News,
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function start() {
    const redis = await connectInfrastructure();
    const app = express();
    const PORT = process.env.PORT || 4000;

    app.use(cors<cors.CorsRequest>(), express.json());

    const server = new ApolloServer({ schema });
    await server.start();

    app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req }) => ({ req, mongo: mongoose.connection, redis })
        })
    );

    app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
        console.log(`📊 Apollo Sandbox: http://localhost:${PORT}/graphql`);
    });

    process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down gracefully...');
        await redis.quit();
        await mongoose.disconnect();
        process.exit(0);
    });
}

start().catch(err => {
    console.error('💥 Failed to start server:', err);
    process.exit(1);
});