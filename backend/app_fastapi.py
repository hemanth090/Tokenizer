from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from tokenizer import AdvancedWordTokenizer
import re

app = FastAPI(
    title="Tokenizer API",
    description="Advanced Word Tokenizer API with vocabulary management",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load tokenizer globally
tokenizer = AdvancedWordTokenizer()
tokenizer.load_vocab('wikipedia_tokenizer.json')

# Pydantic models
class TokenizeRequest(BaseModel):
    text: str

class TokenDetail(BaseModel):
    token: str
    id: int
    type: str
    index: int

class TokenStats(BaseModel):
    total_tokens: int
    unique_tokens: int
    unk_count: int
    compression_ratio: float
    char_count: int

class TokenizeResponse(BaseModel):
    tokens: List[str]
    ids: List[int]
    decoded: str
    token_details: List[TokenDetail]
    stats: TokenStats

class TopWord(BaseModel):
    word: str
    freq: int

class VocabStatsResponse(BaseModel):
    vocab_size: int
    apostrophe_count: int
    hyphen_count: int
    number_count: int
    punctuation_count: int
    examples: dict
    top_words: List[TopWord]

class VocabSearchResult(BaseModel):
    word: str
    id: int
    frequency: int

class VocabSearchResponse(BaseModel):
    results: List[VocabSearchResult]
    query: str

class DecodeRequest(BaseModel):
    ids: List[int]

class DecodeResponse(BaseModel):
    decoded: str
    success: bool
    error: Optional[str] = None

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Tokenizer API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "tokenize": "/api/tokenize",
            "vocab_stats": "/api/vocab/stats",
            "vocab_search": "/api/vocab/search",
            "decode": "/api/decode"
        }
    }

@app.post("/api/tokenize", response_model=TokenizeResponse)
async def tokenize(request: TokenizeRequest):
    """Tokenize input text and return tokens with IDs"""
    text = request.text
    
    if not text.strip():
        return TokenizeResponse(
            tokens=[],
            ids=[],
            decoded='',
            token_details=[],
            stats=TokenStats(
                total_tokens=0,
                unique_tokens=0,
                unk_count=0,
                compression_ratio=0,
                char_count=0
            )
        )
    
    # Tokenize
    tokens = tokenizer.tokenize_text(text)
    ids = tokenizer.encode(text)
    decoded = tokenizer.decode(ids)
    
    # Calculate stats
    unk_id = tokenizer.word2idx.get(tokenizer.UNK, 1)
    unk_count = ids.count(unk_id)
    unique_tokens = len(set(tokens))
    compression_ratio = round(len(text) / len(tokens), 2) if tokens else 0
    
    # Create token details with types
    token_details = []
    for i, (token, token_id) in enumerate(zip(tokens, ids)):
        token_type = 'normal'
        if token_id == unk_id:
            token_type = 'unknown'
        elif re.match(r'^[^\w\s]+$', token):
            token_type = 'punctuation'
        elif re.match(r'^\d+', token):
            token_type = 'number'
        elif "'" in token:
            token_type = 'contraction'
        elif '-' in token:
            token_type = 'hyphenated'
        
        token_details.append(TokenDetail(
            token=token,
            id=token_id,
            type=token_type,
            index=i
        ))
    
    return TokenizeResponse(
        tokens=tokens,
        ids=ids,
        decoded=decoded,
        token_details=token_details,
        stats=TokenStats(
            total_tokens=len(tokens),
            unique_tokens=unique_tokens,
            unk_count=unk_count,
            compression_ratio=compression_ratio,
            char_count=len(text)
        )
    )

@app.get("/api/vocab/stats", response_model=VocabStatsResponse)
async def vocab_stats():
    """Get vocabulary statistics"""
    stats = tokenizer.get_vocab_stats()
    
    # Count token types in full vocab
    apostrophe_count = len([w for w in tokenizer.word2idx if "'" in w])
    hyphen_count = len([w for w in tokenizer.word2idx if '-' in w])
    number_count = len([w for w in tokenizer.word2idx if re.match(r'^\d+', w)])
    punct_count = len([w for w in tokenizer.word2idx if re.match(r'^[^\w\s]+$', w)])
    
    # Get top words
    top_words = [
        TopWord(word=word, freq=freq)
        for word, freq in tokenizer.word_freq.most_common(50)
    ]
    
    return VocabStatsResponse(
        vocab_size=len(tokenizer.word2idx),
        apostrophe_count=apostrophe_count,
        hyphen_count=hyphen_count,
        number_count=number_count,
        punctuation_count=punct_count,
        examples=stats,
        top_words=top_words
    )

@app.get("/api/vocab/search", response_model=VocabSearchResponse)
async def vocab_search(
    q: str = Query("", description="Search query"),
    limit: int = Query(20, description="Maximum number of results")
):
    """Search vocabulary for matching words"""
    query = q.lower().strip()
    
    if not query:
        return VocabSearchResponse(results=[], query=query)
    
    results = []
    for word, idx in tokenizer.word2idx.items():
        if query in word.lower():
            freq = tokenizer.word_freq.get(word, 0)
            results.append(VocabSearchResult(
                word=word,
                id=idx,
                frequency=freq
            ))
            if len(results) >= limit:
                break
    
    # Sort by frequency
    results.sort(key=lambda x: x.frequency, reverse=True)
    
    return VocabSearchResponse(results=results, query=query)

@app.post("/api/decode", response_model=DecodeResponse)
async def decode(request: DecodeRequest):
    """Decode token IDs back to text"""
    try:
        ids = [int(i) for i in request.ids]
        decoded = tokenizer.decode(ids)
        return DecodeResponse(decoded=decoded, success=True)
    except Exception as e:
        return DecodeResponse(decoded="", success=False, error=str(e))

if __name__ == '__main__':
    import uvicorn
    print("\n" + "="*60)
    print("🚀 FastAPI Tokenizer running at http://localhost:8000")
    print("📚 API Docs at http://localhost:8000/docs")
    print("="*60 + "\n")
    uvicorn.run("app_fastapi:app", host="0.0.0.0", port=8000, reload=True)
