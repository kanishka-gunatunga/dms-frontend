/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const namespace = pc.index(process.env.PINECONE_INDEX || '',process.env.PINECONE_HOST).namespace(process.env.PINECONE_NAMESPACE || '');

export async function POST(req: NextRequest) {
  const { chatId } = await req.json();

  console.log(chatId, )
  

  try {
    // const docId = `doc_id_13`;
    const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: "",
      });

    const results = await namespace.query({
        vector: embeddingResponse.data[0].embedding,
        topK: 50,
        filter: {
            "chatId": { "$eq": chatId }
        }
    });

    console.log("results : ",results.matches)

    const idsToDelete = results.matches?.map((match: any) => match.id) ?? [];

    console.log(`Deleting ${idsToDelete.length} vectors for documentId: ${chatId}`);

    if (idsToDelete.length > 0) {
      await namespace.deleteMany(idsToDelete);
    }

    return NextResponse.json({ response: `Deleted ${idsToDelete.length} vectors.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ response: "Something went wrong." }, { status: 500 });
  }
}
