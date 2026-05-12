import {News} from '../../models/News';
import type {ResolverContext} from '../../types';

export const newsResolvers = {
    Query: {
        news: async (_parent: unknown, args: { skip: number; take: number }, ctx: ResolverContext) => {
            try {
                const news = await News.find()
                    .sort({ publishedAt: -1 })
                    .skip(args.skip)
                    .limit(args.take)
                    .lean();

                return news;
            } catch (error) {
                console.error('❌ News fetch error:', error);
                throw new Error('Failed to fetch news');
            }
        },
    },

    Mutation: {
        createNews: async (
            _parent: unknown,
            args: { title: string; url: string; source: string; category: string; publishedAt: string },
            ctx: ResolverContext,
        ) => {
            const newNews = new News({
                ...args,
                publishedAt: new Date(args.publishedAt),
            });
            await newNews.save();
            return newNews;
        },
    },

    News: {
        id: (parent: any) => parent._id?.toString() ?? parent.id,
    },
};