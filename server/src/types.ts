import type mongoose from 'mongoose';
import type {RedisClientType} from 'redis';

export interface ResolverContext {
    req: any;
    mongo: mongoose.Connection;
    redis: RedisClientType;
}