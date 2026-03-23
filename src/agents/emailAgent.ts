import { readFile } from 'node:fs/promises';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { DocumentInterface } from '@langchain/core/documents';
import { createAgent, tool } from 'langchain';
import { PDFParse } from 'pdf-parse';
import { Resend } from 'resend';
import { z } from 'zod/v4';

const model = new ChatOpenAI({ model: 'gpt-4o-mini' });
const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
const curriculumUrl = new URL('../assets/cv.pdf', import.meta.url);

type ToolStatus = 'found' | 'not_found' | 'error' | 'success';

function toolResponse(status: ToolStatus, content: string, data?: unknown) {
  return JSON.stringify({ status, content, data });
}

function sanitizeEnvValue(value: string) {
  const trimmed = value.trim();
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  return unquoted.replace(/^Bearer\s+/i, '').trim();
}

function getEnv(...names: string[]) {
  for (const name of names) {
    const raw = process.env[name];
    if (!raw) continue;

    const value = sanitizeEnvValue(raw);
    if (value.length > 0) {
      return value;
    }
  }

  return null;
}

let cvRetrieverPromise: Promise<
  ReturnType<MemoryVectorStore['asRetriever']>
> | null = null;

async function extractPdfText() {
  const buffer = await readFile(curriculumUrl);
  const parser = new PDFParse({ data: buffer });

  try {
    const { text } = await parser.getText();
    return text.replace(/\s+/g, ' ').trim();
  } finally {
    await parser.destroy();
  }
}

async function buildCvRetriever() {
  const cvText = await extractPdfText();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 750,
    chunkOverlap: 120,
  });

  const chunks = await splitter.splitText(cvText);
  const documents = chunks.map((chunk: string, index: number) => ({
    pageContent: chunk,
    metadata: { chunk: index + 1 },
  }));

  const vectorStore = await MemoryVectorStore.fromDocuments(
    documents,
    embeddings,
  );
  return vectorStore.asRetriever({ k: 4 });
}

async function getCvRetriever() {
  if (!cvRetrieverPromise) {
    cvRetrieverPromise = buildCvRetriever();
  }

  return cvRetrieverPromise;
}

const searchCurriculumInputSchema = z.object({
  question: z
    .string()
    .min(3)
    .describe('Question that should be answered using the curriculum PDF.'),
});

export const searchCurriculum = tool(
  async ({ question }) => {
    try {
      const retriever = await getCvRetriever();
      const docs = await retriever.invoke(question);

      if (docs.length === 0) {
        return toolResponse(
          'not_found',
          'No encontré información suficiente en el CV para responder con confianza.',
        );
      }

      const context = docs
        .map(
          (doc: DocumentInterface, index: number) =>
            `[Fragmento ${index + 1}] ${doc.pageContent}`,
        )
        .join('\n\n');

      return toolResponse('found', context);
    } catch (error) {
      return toolResponse(
        'error',
        error instanceof Error
          ? `No se pudo leer o indexar el CV: ${error.message}`
          : 'No se pudo leer o indexar el CV.',
      );
    }
  },
  {
    name: 'search_curriculum',
    description:
      'Retrieve the most relevant fragments from the curriculum PDF for a question.',
    schema: searchCurriculumInputSchema,
  },
);

const sendEmailInputSchema = z.object({
  question: z
    .string()
    .min(3)
    .describe('User question that could not be answered from the curriculum.'),
});

export const sendEmail = tool(
  async ({ question }) => {
    const apiKey = getEnv('RESEND_API_KEY', 'VITE_RESEND_API_KEY');
    if (!apiKey) {
      return toolResponse(
        'error',
        'Missing RESEND_API_KEY (or VITE_RESEND_API_KEY). Set it in .env and restart npm run dev:server.',
      );
    }

    const recipient = getEnv('CV_FALLBACK_EMAIL', 'RESEND_FALLBACK_EMAIL');
    if (!recipient) {
      return toolResponse(
        'error',
        'Missing CV_FALLBACK_EMAIL (or RESEND_FALLBACK_EMAIL). Set it in .env and restart npm run dev:server.',
      );
    }

    const sender = getEnv('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev';
    const resend = new Resend(apiKey);

    const subject = 'Nueva pregunta sin respuesta del agente CV';
    const html = `<p>El agente CV no pudo responder esta pregunta:</p><blockquote>${question}</blockquote>`;

    const { data, error } = await resend.emails.send({
      from: sender,
      to: [recipient],
      subject,
      html,
    });

    if (error) {
      return toolResponse('error', `Email send failed: ${error.message}`);
    }

    return toolResponse(
      'success',
      `Envié un email de seguimiento a ${recipient}.`,
      data,
    );
  },
  {
    name: 'send_email',
    description:
      'Send a fallback email when a CV question cannot be answered from the document.',
    schema: sendEmailInputSchema,
  },
);

export const emailAgent = createAgent({
  model,
  tools: [searchCurriculum, sendEmail],
  systemPrompt:
    'Eres un asistente que responde preguntas exclusivamente basadas en el CV del usuario. Primero llama a search_curriculum. Si devuelve status found, responde solo con esos fragmentos sin inventar datos. Si devuelve status not_found o no es suficiente para responder con confianza, llama a send_email con la pregunta y luego informa que se ha enviado un email de seguimiento.',
});
