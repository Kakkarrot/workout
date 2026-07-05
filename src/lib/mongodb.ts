import 'server-only';
import {MongoClient} from 'mongodb';

const globalWithMongo = globalThis as typeof globalThis & {
    mongoClientPromise?: Promise<MongoClient>;
};

export function getMongoClient() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI is not configured');
    }

    const promise = globalWithMongo.mongoClientPromise ?? new MongoClient(uri).connect();

    if (process.env.NODE_ENV !== 'production') {
        globalWithMongo.mongoClientPromise = promise;
    }

    return promise;
}
