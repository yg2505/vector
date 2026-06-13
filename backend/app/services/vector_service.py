import os

os.environ["HF_HOME"] = "./model_cache"
os.environ["TRANSFORMERS_CACHE"] = "./model_cache"

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from ..config import settings
class VectorService:
    def __init__(self):
        embedding_function = SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )

        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_DB_PATH
        )

        self.collection = self.client.get_or_create_collection(
            name="user_knowledge",
            embedding_function=embedding_function
        )

    def add_document(self, doc_id: str, text: str, metadata: dict):
        """
        Add a document to the vector database.
        Metadata must contain at least 'user_id' for access control.
        """
        try:
            print("Adding document to Chroma...")
            print("Doc ID:", doc_id)

            self.collection.upsert(
                documents=[text],
                metadatas=[metadata],
                ids=[doc_id]
            )

            print("Document added successfully")

        except Exception as e:
            import traceback
            traceback.print_exc()
            raise e

    def query_similar(self, query_text: str, user_id: int, limit: int = 3):
        """
        Query the database for similar documents, filtered by user_id.
        """
        try:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=limit,
                where={"user_id": user_id}
            )
            
            retrieved_docs = []
            if results and 'documents' in results and results['documents'] and len(results['documents']) > 0:
                documents = results['documents'][0]
                metadatas = results['metadatas'][0] if 'metadatas' in results and results['metadatas'] else []
                for doc, meta in zip(documents, metadatas):
                    retrieved_docs.append({
                        "document": doc,
                        "metadata": meta
                    })
            return retrieved_docs
        except Exception as e:
            # Handle empty db queries gracefully
            return []

vector_service = None

def get_vector_service():
    global vector_service

    if vector_service is None:
        vector_service = VectorService()

    return vector_service

