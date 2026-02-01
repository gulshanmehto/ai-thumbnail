# AI Thumbnail Generator

High-quality YouTube thumbnail generator powered by Gemini 3.

## 🚀 Local Development Setup

### Quick Start

1. Install dependencies:
   ```bash
   npm install              # Install concurrency tool
   npm run install-all      # Install frontend & updated backend deps
   ```

2. Configure Backend:
   - Copy `backend/.env.example` to `backend/.env`
   - Add your `GOOGLE_API_KEY`

3. Run everything:
   ```bash
   npm start
   ```

### Detailed Setup


- Node.js (v18+)
- Python (v3.9+)
- MongoDB (Running locally or a cloud URI)

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Environment Variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `GOOGLE_API_KEY` in `.env` with your Gemini API key.
   - Update `MONGO_URL` if your MongoDB is not on localhost defaults.

5. Run the server:
   ```bash
   uvicorn server:app --reload --port 8000
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm start
   ```

### 3. Usage

- **Frontend**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin (Default login: `admin@quickthumb.me` / `admin123`)
- **API Docs**: http://localhost:8000/docs

### 📝 Notes

- **Payments**: Local environment simulates payments if `PAYU_MERCHANT_KEY` is not set in `.env`.
- **Image Generation**: Requires a valid `GOOGLE_API_KEY` with access to `gemini-3-pro-image-preview`.
