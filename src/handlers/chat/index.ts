import { APIGatewayProxyHandler } from "aws-lambda";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Inicialización de Clientes (fuera del handler para reusar conexiones)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const userQuestion = body.message;

    if (!userQuestion) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Falta el mensaje" }),
      };
    }

    // --- PASO 1: Generar Embedding de la Pregunta ---
    // Convertimos "¿Qué hago si me duele la rodilla?" a números
    const embeddingResponse = await embeddingModel.embedContent(userQuestion);
    const queryEmbedding = embeddingResponse.embedding.values;

    // --- PASO 2: Búsqueda Semántica en Supabase ---
    // Buscamos los fragmentos de conocimiento más parecidos
    const { data: documents, error } = await supabase.rpc(
      "match_turf_knowledge",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.5, // Solo coincidencias relevantes
        match_count: 3, // Dame el top 3 de consejos
      }
    );

    if (error) {
      console.error("Error Supabase:", error);
      throw new Error("Falló la memoria del agente");
    }

    // Convertimos los documentos encontrados a texto plano para el prompt
    const contextText =
      documents?.map((doc: any) => doc.content).join("\n---\n") ||
      "No hay información específica.";

    // --- PASO 3: Generación con Llama 3 (RAG) ---
    const completion = await groq.chat.completions.create({
      // CAMBIO AQUÍ: Usamos el modelo más nuevo y rápido disponible gratis
      model: "llama-3.3-70b-versatile",
      // O si prefieres velocidad extrema usa: 'llama-3.1-8b-instant'
      messages: [
        {
          role: "system",
          content: `Eres el Entrenador Principal de Turf. 
          Usa SOLO el siguiente contexto para responder al usuario. Si la respuesta no está en el contexto, di que no tienes esa información, no inventes.
          
          CONTEXTO DE ENTRENAMIENTO:
          ${contextText}`,
        },
        { role: "user", content: userQuestion },
      ],
      temperature: 0.1,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        response: completion.choices[0].message.content,
        // (Opcional) Devolvemos la fuente para depurar y mostrar que sí usó RAG
        sources: documents?.map((d: any) => d.metadata?.topic),
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno del entrenador AI" }),
    };
  }
};
