from urllib.parse import urlparse
import os, time, uuid, json, requests, re
import feedparser, trafilatura
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()
JINA_API_KEY = os.getenv("JINA_API_KEY")
JINA_EMBED_MODEL = os.getenv("JINA_EMBED_MODEL", "jina-embeddings-v3")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION = os.getenv("COLLECTION_NAME", "news_chunks_demo")

RSS_FEEDS = [
    "https://www.thehindu.com/news/feeder/default.rss",
    "https://indianexpress.com/section/india/feed/",
    "https://www.bbc.com/news/rss.xml",
    "https://feeds.reuters.com/reuters/INtopNews",
]

def fetch_rss_entries(feeds, max_items=200):
    entries, seen = [], set()
    for f in feeds:
        feed = feedparser.parse(f)
        for e in feed.entries:
            link = getattr(e, 'link', None)
            if link and link not in seen:
                seen.add(link)
                entries.append(e)
    return entries[:max_items]

def download_article(url):
    try:
        downloaded = trafilatura.fetch_url(url, no_ssl=True)
        if not downloaded:
            return None
        text = trafilatura.extract(downloaded, include_comments=False, url=url)
        return text
    except Exception:
        return None

def clean_text(t: str) -> str:
    t = re.sub(r"\s+", " ", t or "").strip()
    return t

def chunk_by_words(text, target=400, overlap=100):
    words = clean_text(text).split()
    chunks, i = [], 0
    while i < len(words):
        chunk = " ".join(words[i:i+target])
        if chunk:
            chunks.append(chunk)
        if i + target >= len(words):
            break
        i += (target - overlap)
    return chunks

def jina_embed(texts):
    url = "https://api.jina.ai/v1/embeddings"
    headers = {"Authorization": f"Bearer {JINA_API_KEY}", "Content-Type":"application/json"}
    body = {"model": JINA_EMBED_MODEL, "input": texts}
    r = requests.post(url, headers=headers, data=json.dumps(body), timeout=60)
    r.raise_for_status()
    data = r.json()["data"]
    return [d["embedding"] for d in data]

def ensure_collection(client, size):
    # NOTE: recreate_collection is deprecated in latest qdrant-client.
    # For quick dev it's fine; for production, prefer:
    # if not client.collection_exists(COLLECTION): client.create_collection(...)
    cols = [c.name for c in client.get_collections().collections]
    if COLLECTION not in cols:
        client.recreate_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=size, distance=Distance.COSINE),
        )

def main(target_articles=50):
    entries = fetch_rss_entries(RSS_FEEDS, max_items=200)
    articles = []
    for e in tqdm(entries, desc="Fetch"):
        if len(articles) >= target_articles:
            break
        url = getattr(e, "link", None)
        title = getattr(e, "title", None)
        if not url:
            continue
        text = download_article(url)
        if not text or len(text.split()) < 200:
            continue
        articles.append({
            "id": str(uuid.uuid4()),
            "url": url,
            "title": title,
            "published": getattr(e, "published", None),
            "source": urlparse(url).netloc,
            "text": clean_text(text)
        })
        time.sleep(0.2)

    all_chunks = []
    for art in articles:
        chs = chunk_by_words(art["text"], target=400, overlap=100)
        for idx, c in enumerate(chs):
            all_chunks.append({
                # FIX: each chunk gets a valid UUID (not "uuid-0")
                "id": str(uuid.uuid4()),
                "vector": None,
                "payload": {
                    "text": c,
                    "title": art["title"],
                    "url": art["url"],
                    "published": art["published"],
                    "source": art["source"],
                    "article_id": art["id"],   # keep linkage to the article
                    "chunk_index": idx,
                    "words": len(c.split())
                }
            })

    # Embed in batches
    BATCH = 64
    vectors = []
    for i in tqdm(range(0, len(all_chunks), BATCH), desc="Embed"):
        texts = [c["payload"]["text"] for c in all_chunks[i:i+BATCH]]
        vecs = jina_embed(texts)
        vectors.extend(vecs)

    # Attach vectors and create collection
    for c, v in zip(all_chunks, vectors):
        c["vector"] = v
    dim = len(all_chunks[0]["vector"])

    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    ensure_collection(client, size=dim)

    # Upsert
    points = [PointStruct(id=c["id"], vector=c["vector"], payload=c["payload"]) for c in all_chunks]
    for i in tqdm(range(0, len(points), 256), desc="Upsert"):
        client.upsert(collection_name=COLLECTION, points=points[i:i+256])

    print(f"Done: {len(articles)} articles → {len(all_chunks)} chunks → Qdrant:{COLLECTION}")

if __name__ == "__main__":
    main()
