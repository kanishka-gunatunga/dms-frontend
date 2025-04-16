/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pinecone } from '@pinecone-database/pinecone';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const namespace = pc.index(process.env.PINECONE_INDEX || '', process.env.PINECONE_HOST).namespace(process.env.PINECONE_NAMESPACE || '');
export async function POST(req: NextRequest) {
  const { message, action, documentId, chatId } = await req.json();

  console.log(documentId)


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
    You are a strict summarization assistant.
    
    Your only task is to summarize the provided context when asked. You must not answer questions or perform any tasks outside of summarization.
    
    You may engage in friendly greetings or short acknowledgments (e.g., "Hello!", "Nice to see you!", "How can I help with summarizing today?").
    
    If the user asks anything unrelated to summarization, respond politely that you are only able to help with summarizing the context and cannot assist with that request.
    
    Always use the following context for summarization:
    
    Context:
    ${combinedText}
    `
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
