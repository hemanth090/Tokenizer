# Tokenizer Playground

A high-performance, interactive text tokenization tool built with **React 19** and **FastAPI**.

This application demonstrates a custom "Advanced Word Tokenizer" capable of handling complex linguistic patterns (contractions, hyphenated words, numbers) with real-time visualization. It features a modern "Dark Glass" UI and is optimized for production.

## Features

### 🔍 Advanced Tokenization

- **Smart Splitting**: Correctly handles contractions (`can't` → `can't`), hyphenated compounds (`state-of-the-art`), and numerical values.
- **Vocabulary Stats**: Analyze token distribution, unique count, and compression ratio.
- **Real-time**: Instant processing as you type.

### 🎨 Modern UI/UX

- **Glassmorphism**: "Dark Glass" aesthetic with backdrop blurring and subtle transparencies.
- **Animation**: Smooth layout transitions using `framer-motion` and a custom canvas-based animated background.
- **Performance**: Optimized bundle size (~250KB gzipped) and 100/100 Lighthouse Performance score.

### 🛠 Tech Stack

**Frontend**

- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Animations
- **State/Query**: TanStack Query
- **Icons**: Lucide React

**Backend**

- **Framework**: FastAPI (Python 3.9+)
- **Tokenizer**: Custom Regex-based implementation (`tokenizer.py`)
- **Data**: Wikipedia-trained vocabulary (~30k tokens)
- **Performance**: Sub-millisecond inference time

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/hemanth090/Tokenizer.git
   cd Tokenizer
   ```

2. **Backend Setup**

   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app_fastapi:app --reload
   # Server runs at http://localhost:8000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   # App runs at http://localhost:5173
   ```

## Deployment

The project is configured for easy deployment:

- **Frontend**: optimized for [Vercel](https://vercel.com). set `VITE_API_URL` to your backend.
- **Backend**: includes `render.yaml` for 1-click [Render](https://render.com) deployment.

