import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { Pinecone } from '@pinecone-database/pinecone'


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const namespace = pc.index(process.env.PINECONE_INDEX || '', process.env.PINECONE_HOST).namespace(process.env.PINECONE_NAMESPACE || '');


export async function POST(req: NextRequest) {
  const { message, action, documentId, chatId } = await req.json();

  console.log(documentId)
  console.log("action : ", action)

  try {

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: message,
    });

    const results = await namespace.query({
      vector: embeddingResponse.data[0].embedding,
      topK: 50,
      filter: {
        chatId: { $eq: chatId }
      },
      includeMetadata: true
    });


    // console.log("All metadata:\n", results.matches[0].metadata);

    const combinedText = results.matches
      .map(match => match.metadata?.chunk_text)
      .filter(Boolean)
      .join('\n');

    console.log(combinedText);


    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `
    You are a precise assistant that only answers questions strictly using the provided document context below.
    
    Rules:
    - Do NOT generate or infer any information not explicitly present in the context.
    - You may engage in friendly greetings or short acknowledgments.
    - If the answer is not clearly stated in the context, respond with:
      "Sorry, I couldn't find any information on that in the provided document."
    -You may engage in friendly greetings or short acknowledgments.
    Context:
    ${combinedText}
          `.trim(),
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });


    const response = chatCompletion.choices[0].message.content;

    return NextResponse.json({ response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ response: "Something went wrong." }, { status: 500 });
  }
}
