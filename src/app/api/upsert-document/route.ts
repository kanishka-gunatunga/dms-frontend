import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

import { Pinecone } from '@pinecone-database/pinecone'


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const namespace = pc.index(process.env.PINECONE_INDEX || '',process.env.PINECONE_HOST).namespace(process.env.PINECONE_NAMESPACE || '');


function chunkText(text: string, chunkSize: number = 6000): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}


export async function POST(req: NextRequest) {
  const { chatId } = await req.json();

  console.log(chatId)
  let pdfContext = '';

  try {
    const filePath = path.join(process.cwd(), 'docs', 'sample-research-proposal.pdf');
    console.log("filePath : ", filePath)
    const pdfBuffer = await fs.readFile(filePath);
    const parsedPdf = await pdfParse(pdfBuffer);
    pdfContext = parsedPdf.text.replace(/\n/g, '');

    console.log("pdfContext : ", pdfContext)

    const chunks = chunkText(pdfContext);


    for (const [idx, chunk] of chunks.entries()) {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk,
      });
      
      const record = {
        id: `${chatId}_${idx}`,
        values: embeddingResponse.data[0].embedding,
        metadata: {
          chunk_text: chunk,
          chatId: chatId, 
          docId: `doc_id_${chatId}`,
        }
      };

      console.log("record : ", record)

      await namespace.upsert([record]);

      console.log(`Upserted record: ${chatId}_${idx}`);
    }

    console.log("All chunks have been upserted!");

    return NextResponse.json({ response: "success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ response: "failed" }, { status: 500 });
  }
}
