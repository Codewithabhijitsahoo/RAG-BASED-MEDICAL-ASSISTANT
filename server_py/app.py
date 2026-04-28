from flask import Flask, render_template, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

app = Flask(__name__)
CORS(app)

load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

pc = Pinecone(api_key=PINECONE_API_KEY)

# ✅ LOCAL EMBEDDINGS (FIXED PATH)

embedding = HuggingFaceEmbeddings(
    model_name=r"D:\huggingface_models\hub\models--sentence-transformers--all-MiniLM-L6-v2\snapshots\c9745ed1d9f207416be6d2e6f8de32d1f16199bf",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True},
)

vectorstore = PineconeVectorStore.from_existing_index(
    index_name="medical-chatbot",
    embedding=embedding
)

llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.5-flash",
    temperature=0.2
)


@app.route("/")
def intro():
    return render_template("intro.html")


@app.route("/chat")
def index():
    return render_template("chat.html")

@app.route("/get", methods=["POST"])
def chat():

    
    query = request.form.get("msg", "").strip()
    if not query:
        return "Please enter a medical question."

    if query.lower() in {"hi", "hello", "hey", "hii", "hai", "hy"}:
        return "👋 I’m a medical assistant. How can I help you?"

    docs_with_scores = vectorstore.similarity_search_with_score(query, k=5)

    filtered_docs = [
        doc for doc, score in docs_with_scores if score <= 0.7
    ]

    if not filtered_docs:
        return (
            "⚠️ I do not have enough medical information to answer this safely.\n\n"
            "Please consult a qualified healthcare professional."
        )

    context = "\n\n".join(doc.page_content for doc in filtered_docs)

    prompt = f"""
You are a medical assistant for question-answering tasks.
Use the retrieved context to answer the question.

IMPORTANT:
- Write the answer in EXACTLY 3 lines.
- Each line should be a complete sentence.
- Do NOT write more or fewer than 3 lines.
- If you don't know the answer, say that you don't know.

Context:
{context}

Question:
{query}
"""

    response = llm.invoke(prompt)
    return response.content.strip()

if __name__ == "__main__":
    app.run(debug=True, port=8080)
