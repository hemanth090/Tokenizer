# FastAPI Tokenizer - Setup Instructions

## Installation

Install the required dependencies:

```bash
pip install fastapi uvicorn[standard] pydantic python-multipart
```

## Running the FastAPI Server

```bash
python app_fastapi.py
```

Or using uvicorn directly:

```bash
uvicorn app_fastapi:app --reload --port 8000
```

## API Documentation

Once running, visit:

- **Interactive API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

## Endpoints

### POST /api/tokenize

Tokenize input text and return detailed token information.

**Request:**

```json
{
  "text": "Hello, world!"
}
```

**Response:**

```json
{
  "tokens": ["hello", ",", "world", "!"],
  "ids": [123, 45, 678, 90],
  "decoded": "hello, world!",
  "token_details": [...],
  "stats": {
    "total_tokens": 4,
    "unique_tokens": 4,
    "unk_count": 0,
    "compression_ratio": 3.25,
    "char_count": 13
  }
}
```

### GET /api/vocab/stats

Get vocabulary statistics including token type counts and top words.

### GET /api/vocab/search?q=word&limit=20

Search vocabulary for matching words.

### POST /api/decode

Decode token IDs back to text.

**Request:**

```json
{
  "ids": [123, 45, 678, 90]
}
```

## Key Features

- ✅ Full type safety with Pydantic models
- ✅ Automatic API documentation
- ✅ CORS enabled for frontend integration
- ✅ Request/response validation
- ✅ Better performance than Flask
- ✅ Async support ready
