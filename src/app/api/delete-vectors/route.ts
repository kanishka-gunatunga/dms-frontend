export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const namespace = pc.index(process.env.PINECONE_INDEX || '', process.env.PINECONE_HOST).namespace(process.env.PINECONE_NAMESPACE || '');

export async function POST(req: NextRequest) {
  const { chatId } = await req.json();

  if (!chatId) {
    return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
  }

  try {
    const results = await namespace.query({
      vector: new Array(1536).fill(0),
      topK: 100,
      filter: {
        docId: { $eq: `doc_id_${chatId}` }
      },
    });

    const idsToDelete = results.matches?.map(match => match.id) ?? [];

    if (idsToDelete.length > 0) {
      await namespace.deleteMany(idsToDelete);
    }

    return NextResponse.json({ deleted: idsToDelete.length });
  } catch (error) {
    console.error("Error deleting vectors", error);
    return NextResponse.json({ error: 'Failed to delete vectors' }, { status: 500 });
  }
}
