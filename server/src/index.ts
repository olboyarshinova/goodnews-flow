import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';

const typeDefs = `#graphql
  type Query {
    hello: String
    news: [News!]!
  }
  type News {
    id: ID!
    title: String!
    source: String!
    publishedAt: String!
  }
`;

const resolvers = {
    Query: {
        hello: () => 'Good News API is running! 🚀',
        news: () => [
            { id: '1', title: 'Учёные нашли способ очистки океана', source: 'ScienceDaily', publishedAt: new Date().toISOString() },
            { id: '2', title: 'Волонтёры высадили 1 млн деревьев', source: 'EcoWatch', publishedAt: new Date().toISOString() }
        ]
    }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function startServer() {
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
            context: async ({ req }) => ({ req }) // ✅ Правильная сигнатура для v4
        })
    );

    app.listen(PORT, () => {
        console.log(`✅ Server ready at http://localhost:${PORT}/graphql`);
        console.log(`📊 Apollo Sandbox: http://localhost:${PORT}/graphql`);
    });

    process.on('SIGINT', () => {
        console.log('\n🛑 Server shutting down...');
        process.exit(0);
    });
}

startServer().catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});