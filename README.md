# Turf AI Agent: Entrenador de Running Agéntico (Serverless RAG)

> Un entrenador personal de running impulsado por IA, construido con una arquitectura Serverless RAG para respuestas precisas basadas en conocimiento experto, sin alucinaciones y con costo de mantenimiento cercano a cero.

## 🏗️ Arquitectura y Decisiones Técnicas

<img width="1220" height="596" alt="image" src="https://github.com/user-attachments/assets/232ab631-7d3b-4189-bc10-8a08cb81e087" />


Este proyecto demuestra la implementación de un sistema de **Retrieval-Augmented Generation (RAG)** moderno, alejándose de los monolitos tradicionales hacia una arquitectura de microservicios basada en eventos.

### Decisiones Clave:

1.  **Por qué RAG y no Fine-Tuning:** Para garantizar que el agente solo responda con información de entrenamiento validada (almacenada en nuestra DB) y evitar alucinaciones médicas o deportivas peligrosas. Es más fácil actualizar un registro en la base de datos que re-entrenar un modelo completo.
2.  **AWS Serverless (SAM + Lambda):** Se eligió una arquitectura orientada a eventos para optimizar costos. El sistema escala a cero cuando no está en uso, ideal para un MVP o un producto en fase inicial. Se usó TypeScript para tipado estricto y seguridad.
3.  **Estrategia Multi-Modelo (AI Composite):**
    * **Cerebro (Razonamiento):** Llama 3 (vía Groq) por su velocidad de inferencia superior y bajo costo.
    * **Embeddings (Vectorización):** Google Gemini por su eficiencia y generoso tier gratuito para transformar texto a vectores.
4.  **Memoria Vectorial (Supabase/pgvector):** Se utilizó PostgreSQL como base de datos vectorial para aprovechar la robustez de SQL junto con la búsqueda semántica, simplificando el stack de datos.

## 🛠️ Stack Tecnológico

* **Backend:** AWS Lambda (Node.js 20.x), TypeScript.
* **IaC:** AWS SAM (CloudFormation).
* **Vector DB:** Supabase (PostgreSQL + pgvector).
* **LLM Inference:** Groq (Llama 3.3).
* **Embeddings:** Google Generative AI (Gemini).
* **Frontend:** Next.js 14 (App Router), Tailwind CSS.
