import { Pinecone } from '@pinecone-database/pinecone';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const namespace = pc.index(process.env.PINECONE_INDEX || '', process.env.PINECONE_HOST).namespace(process.env.PINECONE_NAMESPACE || '');
export async function POST(req: NextRequest) {
  const { tone, chatId } = await req.json();

 

  try {
    let finalResponse = '';

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: '',
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
    if (!tone) {
      const toneAnalysisMessages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `
You are a strict assistant specialized in tone analysis.

Instructions:
1. Only analyze and describe the tone of the following document.
2. Do not rewrite the document.
3. Format your response clearly using:
   - <h3> for section headings
   - <ul> and <li> for bullet points
   - No <head> or <body> tags
4. End your response with this sentence: "Please select a tone if you'd like me to rewrite the document."

Context:
${combinedText}
`.trim()
,
        },
        {
          role: 'user',
          content: 'What is the tone of the document above?',
        },
      ];

      const toneResult = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: toneAnalysisMessages,
      });

      finalResponse = toneResult.choices[0].message.content || '';
    } else {
      const rewriteMessages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `
You are a strict assistant specialized in tone analysis and tone modification.

Instructions:
1. Rewrite the provided document in the tone specified by the user.
2. Do not describe the original tone.
3. Format your response clearly using:
   - <h3> for section headings
   - <ul> and <li> for bullet points
   - No <head> or <body> tags

Context:
 ${combinedText}
Please select a tone if you'd like me to rewrite the document.`.trim(),
        },
        {
          role: 'user',
          content: `Rewrite the document in a ${tone} tone.`,
        },
      ];

      const rewriteResult = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: rewriteMessages,
      });

      finalResponse = rewriteResult.choices[0].message.content || '';
    }

    return NextResponse.json({ response: finalResponse });
  } catch (error) {
    console.error('Tone API Error:', error);
    return NextResponse.json({ response: 'Something went wrong.' }, { status: 500 });
  }
}
