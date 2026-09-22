# AI Interview Prep Kit 🚀 (PrepWise)

An intelligent, full-stack application that transforms a simple Job Description and Company URL into a **personalized, research-backed interview preparation kit**. Built for the modern job seeker, this platform dynamically generates tailored study plans, flashcards, mock interview questions, and provides an instant compatibility score against your own resume using state-of-the-art LLMs (powered by Groq).

## ✨ Features

* **Company Research Automation**: Instantly scrapes and synthesizes public company data to understand their mission, culture, and core products.
* **AI-Powered Requirement Extraction**: Breaks down complex Job Descriptions into atomic, categorized requirements (Technical, Behavioral, Domain).
* **Resume Compatibility Evaluation**: Upload your resume (PDF or TXT) and instantly receive a percentage match, key strengths, and missing gaps based on the parsed job requirements.
* **Dynamic Study Schedules**: Automatically allocates practice questions across the exact number of days you have left before your interview.
* **Flashcards & Mock Interviews**: Generates targeted flashcards and categorized practice questions (System Design, Behavioral, etc.) to test your knowledge.
* **Immersive Creative UI**: A sleek, dark-mode glassmorphic interface featuring a floating Mac-style navigation dock and smooth Framer Motion animations.

## 🛠️ Tech Stack

### Frontend

* **Framework**: Next.js (App Router)
* **Styling**: Tailwind CSS v4
* **Animations**: Framer Motion
* **State Management & Fetching**: React Query
* **Icons**: Lucide React

### Backend

* **Runtime**: Node.js & Express
* **Language**: TypeScript
* **Database**: MongoDB (via Mongoose)
* **AI Integration**: Groq API SDK (using `llama3-70b-8192` and `mixtral-8x7b-32768`)
* **Web Crawling**: Cheerio, Axios, Robots-parser
* **File Parsing**: Multer & PDF-Parse

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* Local or Cloud MongoDB Instance (default port 27017)
* Groq API Key

### 1. Clone the repository

```bash
git clone https://github.com/Sacchi0504/PrepWise.git
cd PrepWise
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/ai-prep-kit
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend development server:

```bash
npm run dev
```

*(The backend runs on `http://localhost:8000`)*

### 3. Frontend Setup

Open a new terminal and navigate to the frontend:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

*(The frontend runs on `http://localhost:3000` or `3001`)*

### 4. Test it out!

Navigate to your frontend URL in the browser, register an account, and generate your first kit!

## 📂 Project Structure

* `/frontend`: Next.js application containing the immersive Dashboard and Kit Overview pages.
* `/backend/server/pipeline`: The core AI processing pipeline including web scraping, resume evaluation, requirement extraction, and content generation.
* `/backend/server/models`: Mongoose database schemas defining the complex `Kit` structure.

---

*Developed for the Trao Full-Stack Engineering Assessment.*
