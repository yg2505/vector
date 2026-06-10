import chromadb
from ..config import settings

class VectorService:
    def __init__(self):
        # Create persistent local directory for ChromaDB
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        # Get or create collection for Vector search
        self.collection = self.client.get_or_create_collection(name="user_knowledge")

    def add_document(self, doc_id: str, text: str, metadata: dict):
        """
        Add a document to the vector database.
        Metadata must contain at least 'user_id' for access control.
        """
        self.collection.upsert(
            documents=[text],
            metadatas=[metadata],
            ids=[doc_id]
        )

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

vector_service = VectorService()
