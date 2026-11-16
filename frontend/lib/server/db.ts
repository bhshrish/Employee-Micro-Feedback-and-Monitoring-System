import mongoose from "mongoose";

let connection: Promise<typeof mongoose> | undefined;

export async function connectDatabase(): Promise<typeof mongoose> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI must be configured for the Next.js API");
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (!connection) {
        connection = mongoose.connect(uri).catch((error: unknown) => {
            connection = undefined;
            throw error;
        });
    }

    return connection;
}
