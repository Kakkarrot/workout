import {NextResponse} from 'next/server';
import {getMongoClient} from '../../../../../lib/mongodb';

type RouteContext = {params: Promise<{puzzleId: string}>};

async function statesCollection() {
    const client = await getMongoClient();
    return client.db(process.env.MONGODB_DB || 'randomgym').collection<{
        _id: string;
        state: Record<string, unknown>;
        updatedAt: Date;
    }>('puzzleStates');
}

export async function GET(_request: Request, {params}: RouteContext) {
    const {puzzleId} = await params;
    const document = await (await statesCollection()).findOne({_id: puzzleId});

    return NextResponse.json(document?.state ?? {});
}

export async function PUT(request: Request, {params}: RouteContext) {
    const {puzzleId} = await params;
    const state: unknown = await request.json();

    if (!state || typeof state !== 'object' || Array.isArray(state)) {
        return NextResponse.json({error: 'State must be a JSON object'}, {status: 400});
    }

    await (await statesCollection()).updateOne(
        {_id: puzzleId},
        {$set: {state: state as Record<string, unknown>, updatedAt: new Date()}},
        {upsert: true},
    );

    return NextResponse.json(state);
}
