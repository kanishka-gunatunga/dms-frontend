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
      messages: [
        {
          role: 'system',
          content: `
You are a content generation assistant.

Your ONLY job is to generate **new content** based on the user’s request and the context provided.
Do NOT summarize, answer questions, explain, or analyze anything.
Strictly focus on creating new material as directed by the user.

IMPORTANT FORMATTING RULES:
- Use <h3> for major section titles and <h4> for subsections.
- Use <ul><li>...</li></ul> for any lists (bulleted).
- Do NOT include <html>, <head>, <body>, or any boilerplate tags.
- Keep the structure clean and semantic — just pure content elements.
-You may engage in friendly greetings or short acknowledgments.

Use the following context as the foundation:

Context:
${combinedText}
`.trim()

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
