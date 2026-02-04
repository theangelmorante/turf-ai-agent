import "dotenv/config"; // Carga el .env automáticamente
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Configuración de clientes
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const googleApiKey = process.env.GOOGLE_API_KEY!;

if (!supabaseUrl || !supabaseKey || !googleApiKey) {
  console.error("❌ Faltan variables de entorno en el archivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(googleApiKey);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

// 2. Conocimiento Experto de Running (El "Cerebro" del Entrenador)
const runningKnowledge = [
  {
    topic: "Lesiones",
    content:
      "Si sientes dolor agudo en la rodilla (rodilla de corredor), reduce el volumen de entrenamiento inmediatamente. Fortalecer los glúteos y caderas ayuda a prevenir esta lesión común.",
  },
  {
    topic: "Entrenamiento",
    content:
      "La regla del 10%: No aumentes tu kilometraje semanal más de un 10% respecto a la semana anterior para evitar sobrecargas y fracturas por estrés.",
  },
  {
    topic: "Hidratación",
    content:
      "Para carreras de menos de una hora, el agua suele ser suficiente. Para esfuerzos de más de 60-90 minutos, es necesario reponer electrolitos y carbohidratos.",
  },
  {
    topic: "Velocidad",
    content:
      "El entrenamiento de intervalos (Fartlek) mejora la capacidad aeróbica. Un ejemplo básico es: 1 minuto rápido, 2 minutos de recuperación suave, repetido 8 veces.",
  },
  {
    topic: "Calzado",
    content:
      "Las zapatillas de correr tienen una vida útil de entre 500 y 800 km. Usarlas más allá de este límite reduce la amortiguación y aumenta el riesgo de lesiones.",
  },
  {
    topic: "Descanso",
    content:
      "El descanso es parte del entrenamiento. Dormir al menos 7-8 horas es crucial para la reparación muscular y la adaptación fisiológica.",
  },
];

async function seed() {
  console.log("🌱 Iniciando la siembra de conocimientos en Turf...");

  for (const item of runningKnowledge) {
    try {
      // A. Generar Embedding con Google Gemini
      const result = await model.embedContent(item.content);
      const embedding = result.embedding.values;

      // B. Guardar en Supabase
      const { error } = await supabase.from("turf_knowledge").insert({
        content: item.content,
        metadata: { topic: item.topic, source: "Turf Expert DB" },
        embedding: embedding,
      });

      if (error) throw error;

      console.log(`✅ Insertado: ${item.topic}`);
    } catch (err) {
      console.error(`❌ Error insertando ${item.topic}:`, err);
    }
  }

  console.log("🏁 Proceso finalizado.");
}

seed();
