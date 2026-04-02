# Welcome to your Lovable project

Local frontend (Vite + React)

Install and start the frontend:

```powershell
npm install
npm run dev
# build for production
npm run build
npm run preview
# tests
npm run test
npm run test:watch
```

Simple local auth server (Express + sqlite3)

I added a minimal server at `server/` which stores users in a local SQLite file and hashes passwords with bcryptjs.

To run the server (from repository root):

```powershell
cd server
npm install
npm run start
# or for dev with auto-restart (if you install nodemon globally or as a devDependency):
# npm run dev
```

The server exposes:
- POST /api/signup  { name, email, password }  -> 201 { user }
- POST /api/login   { email, password }         -> 200 { user }
- GET  /api/health  -> 200 { ok: true }

Frontend notes
- `src/hooks/useAuth.tsx` was updated to call the local server at `http://localhost:4000` (or use `VITE_API_BASE` env var). Successful login/signup stores `medchat_auth` in localStorage.

Security & production
- This server is intended for local development and demonstration only. For production you should add HTTPS, proper session handling or JWTs, input sanitization, rate limiting, email verification, and run the DB in a managed environment.

If you want, I can also:
- Add JWT session support
- Wire sign-out to invalidate tokens server-side
- Add migrations or use an ORM

Python chat backend
-------------------

I added a simple Flask-based chat backend under `server_py/` using your provided logic. Files added:

- `server_py/app.py` — the Flask app (exposes POST `/get` for chat queries)
- `server_py/.env.example` — example env variables (`PINECONE_API_KEY`, `GOOGLE_API_KEY`)
- `server_py/requirements.txt` — Python package hints (you may need to adjust package names)

To run the Python backend:

```powershell
cd server_py
python -m venv .venv
.\.venv\Scripts\Activate.ps1    # on PowerShell
pip install -r requirements.txt
# copy .env.example to .env and fill keys
python app.py
```

The frontend chat hook is configured to call this backend at `http://localhost:8080/get` by default. You can change the URL by setting `VITE_CHAT_API_BASE` in your Vite env.

Warning: the requirements in `server_py/requirements.txt` include integration packages that may need exact names or versions. If `pip install -r requirements.txt` fails, install the packages listed in your working environment (LangChain/pinecone/google client libs) according to their official docs.

