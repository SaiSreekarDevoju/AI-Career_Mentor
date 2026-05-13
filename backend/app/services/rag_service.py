from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from app.core.config import settings

class JobRAGService:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=settings.GEMINI_API_KEY or "dummy_key_to_prevent_pydantic_crash"
        )
        self.vector_store = Chroma(
            collection_name="jobs",
            embedding_function=self.embeddings,
            persist_directory="./chroma_db"
        )

    def populate_dummy_jobs(self):
        """Populate vector store with some dummy tech jobs for demonstration"""
        jobs = [
            {"text": "Senior Frontend Engineer at Stripe. Requires deep React, Next.js, and TypeScript experience. Remote.", "metadata": {"title": "Senior Frontend Engineer", "company": "Stripe", "match": 92}},
            {"text": "Backend Python Developer at Anthropic. FastAPI, LangChain, and AI agents. Hybrid.", "metadata": {"title": "Backend AI Developer", "company": "Anthropic", "match": 88}},
            {"text": "Full Stack Software Engineer at Google. Requires Next.js, FastAPI, PostgreSQL, and scalable systems.", "metadata": {"title": "Full Stack Engineer", "company": "Google", "match": 95}},
            {"text": "Data Scientist at OpenAI. Heavy Python, PyTorch, LLMs, and RAG architectures.", "metadata": {"title": "Data Scientist", "company": "OpenAI", "match": 75}}
        ]
        
        texts = [j["text"] for j in jobs]
        metadatas = [j["metadata"] for j in jobs]
        
        # Only populate if empty to avoid duplicates
        if self.vector_store._collection.count() == 0:
            self.vector_store.add_texts(texts=texts, metadatas=metadatas)

    def search_jobs(self, user_skills: str, limit: int = 3):
        return self.vector_store.similarity_search(user_skills, k=limit)
