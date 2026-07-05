import {NextResponse} from 'next/server';
import {FieldValue} from 'firebase-admin/firestore';
import {puzzlePersistenceFor} from '../../../../../features/puzzlePersistence';
import {getFirestoreDatabase} from '../../../../../lib/firestore';

type RouteContext = {params: Promise<{puzzleId: string}>};

export async function GET(_request: Request, {params}: RouteContext) {
    const {puzzleId} = await params;
    const persistence = puzzlePersistenceFor(puzzleId);
    if (!persistence) return puzzleNotFound();
    const document = await getFirestoreDatabase().collection('puzzleStates').doc(puzzleId).get();
    const storedState: unknown = document.data()?.state;
    if (storedState === undefined) return NextResponse.json(null);

    const normalizedState = persistence.normalize(storedState);
    if (!normalizedState) return invalidStateResponse();
    return NextResponse.json(normalizedState);
}

export async function PUT(request: Request, {params}: RouteContext) {
    const {puzzleId} = await params;
    const persistence = puzzlePersistenceFor(puzzleId);
    if (!persistence) return puzzleNotFound();
    const state: unknown = await request.json();

    const storedState = persistence.normalize(state);
    if (!storedState) return invalidStateResponse(400);

    await getFirestoreDatabase().collection('puzzleStates').doc(puzzleId).set({
        state: storedState,
        updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(storedState);
}

function puzzleNotFound() {
    return NextResponse.json({error: 'Puzzle not found'}, {status: 404});
}

function invalidStateResponse(status = 500) {
    return NextResponse.json({error: 'State is not a valid puzzle board'}, {status});
}
