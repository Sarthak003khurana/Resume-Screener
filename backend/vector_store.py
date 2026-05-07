import os
import faiss
import pickle
import numpy as np

from sentence_transformers import SentenceTransformer


# LOAD EMBEDDING MODEL
try:

    model = SentenceTransformer(
        "sentence-transformers/all-MiniLM-L6-v2"
    )

    print("Vector model loaded")

except Exception as e:

    print("Vector model error:", e)

    model = None


# CACHE DIRECTORY
CACHE_DIR = "cache"

if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)


# FILE PATHS
INDEX_PATH = os.path.join(
    CACHE_DIR,
    "faiss_index.index"
)

DOCS_PATH = os.path.join(
    CACHE_DIR,
    "documents.pkl"
)


# EMBEDDING DIMENSION
dimension = 384


# LOAD EXISTING INDEX
if os.path.exists(INDEX_PATH):

    index = faiss.read_index(INDEX_PATH)

    print("FAISS index loaded")

else:

    index = faiss.IndexFlatL2(dimension)

    print("New FAISS index created")


# LOAD DOCUMENTS
if os.path.exists(DOCS_PATH):

    with open(DOCS_PATH, "rb") as f:
        documents = pickle.load(f)

    print("Documents loaded")

else:

    documents = []


# SAVE CACHE
def save_cache():

    try:

        faiss.write_index(index, INDEX_PATH)

        with open(DOCS_PATH, "wb") as f:
            pickle.dump(documents, f)

    except Exception as e:

        print("Cache save error:", e)


# ADD DOCUMENTS
def add_documents(texts):

    if model is None:
        return

    try:

        embeddings = model.encode(texts)

        embeddings = np.array(
            embeddings
        ).astype("float32")

        index.add(embeddings)

        documents.extend(texts)

        save_cache()

    except Exception as e:

        print("FAISS ADD ERROR:", e)


# SEARCH DOCUMENTS
def search(query, k=3):

    if model is None:
        return []

    if len(documents) == 0:
        return []

    try:

        query_embedding = model.encode([query])

        query_embedding = np.array(
            query_embedding
        ).astype("float32")

        distances, indices = index.search(
            query_embedding,
            k
        )

        results = []

        for i in indices[0]:

            if i < len(documents):
                results.append(documents[i])

        return results

    except Exception as e:

        print("FAISS SEARCH ERROR:", e)

        return []