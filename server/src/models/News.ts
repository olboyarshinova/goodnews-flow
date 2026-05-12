import mongoose, { Schema, Document } from 'mongoose';

export interface INews extends Document {
    title: string;
    excerpt?: string;
    url: string;
    source: string;
    category: string;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const newsSchema = new Schema<INews>(
    {
        title: { type: String, required: true, trim: true },
        excerpt: { type: String, trim: true },
        url: { type: String, required: true, unique: true },
        source: { type: String, required: true },
        category: { type: String, required: true, index: true },
        publishedAt: { type: Date, required: true, index: true },
    },
    { timestamps: true },
);

export const News = mongoose.model<INews>('News', newsSchema);