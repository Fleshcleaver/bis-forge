# ⚔️ BiS Forge — Destiny 2 Best in Slot Build Planner

A full-stack productivity app for Destiny 2 players to create, save, and share
optimized gear builds — powered by the Bungie Manifest API and AI recommendations via Groq.

---

## 🗂️ Project Structure

```
bis-forge/
├── backend/
│   ├── app/
│   │   ├── __init__.py              # App factory, extensions, CORS
│   │   ├── config.py                # Environment variable config
│   │   ├── models/
│   │   │   └── models.py            # User, Build, GearItem, BuildItem
│   │   ├── routes/
│   │   │   ├── auth_routes.py       # /api/auth — register, login, /me
│   │   │   ├── build_routes.py      # /api/builds — full CRUD + gear items
│   │   │   ├── gear_routes.py       # /api/gear — search + Bungie fetch
│   │   │   └── ai_routes.py         # /api/ai — Groq build analysis
│   │   └── services/
│   │       └── bungie_service.py    # Bungie Manifest API integration
│   ├── run.py                       # Entry point
│   ├── requirements.txt
│   └── .env                         # Your API keys (never commit this!)
│
└── frontend/
    └── src/
        ├── components/
        │   ├── builds/
        │   │   ├── BuildCard.jsx    # Build summary card
        │   │   └── BuildCard.css
        │   ├── gear/
        │   │   ├── GearSearch.jsx   # Search + fetch gear by Bungie hash
        │   │   └── GearSearch.css
        │   ├── ai/
        │   │   ├── AIPanel.jsx      # AI recommendation panel
        │   │   └── AIPanel.css
        │   └── layout/
        │       ├── Navbar.jsx       # Top navigation bar
        │       ├── Navbar.css
        │       ├── LoadingSpinner.jsx
        │       ├── LoadingSpinner.css
        │       ├── ErrorMessage.jsx
        │       └── ErrorMessage.css
        ├── pages/
        │   ├── AuthPage.jsx         # Login / Register
        │   ├── DashboardPage.jsx    # User's saved builds
        │   ├── BuildEditorPage.jsx  # Create / edit a build
        │   └── CommunityPage.jsx    # Public builds feed
        ├── context/
        │   └── AuthContext.jsx      # Global auth state
        └── utils/
            └── api.js               # All fetch helpers
```

---

## 🚀 Setup Instructions (Windows / VS Code + WSL)

### 1. Get Your API Keys

**Bungie API Key (free):**
1. Go to https://www.bungie.net/developer
2. Create a new application
3. Set OAuth Client Type to "Not Applicable"
4. Copy your API Key

**Groq API Key (free):**
1. Go to https://console.groq.com
2. Create a free account
3. Click API Keys → Create API Key
4. Copy the key (you only see it once!)

---

### 2. Backend Setup

Open a terminal in VS Code and run:

```bash
cd bis-forge/backend

# Install venv if needed (WSL/Ubuntu)
sudo apt install python3.12-venv

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file and fill in your keys
touch .env
```

Add this to your `.env` file:
```
SECRET_KEY=any-random-string
JWT_SECRET_KEY=another-random-string
DATABASE_URL=sqlite:///bisforge.db
BUNGIE_API_KEY=your-bungie-key-here
GROQ_API_KEY=your-groq-key-here
```

Then run Flask:
```bash
python3 run.py
```

Flask will be running at: **http://localhost:5000**

> ⚠️ Every time you open a new terminal, activate venv first with `source venv/bin/activate`

---

### 3. Frontend Setup

Open a **second terminal** and run:

```bash
cd bis-forge/frontend
npm install react-router-dom
npm start
```

React will be running at: **http://localhost:3000**

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/builds/ | Yes | Get user's builds |
| GET | /api/builds/public | No | Community feed |
| POST | /api/builds/ | Yes | Create build |
| PATCH | /api/builds/:id | Yes | Update build |
| DELETE | /api/builds/:id | Yes | Delete build |
| POST | /api/builds/:id/items | Yes | Add gear to build |
| DELETE | /api/builds/:id/items/:itemId | Yes | Remove gear from build |
| GET | /api/gear/ | No | Search saved gear |
| POST | /api/gear/fetch | Yes | Fetch gear from Bungie by hash |
| POST | /api/ai/recommend | Yes | Get AI build recommendation |

---

## 🎮 How to Find Bungie Item Hashes

To add gear to a build you need the item's Bungie hash ID. Find them at:
- **https://www.light.gg** — search any item, hash is in the URL
- **https://d2gunsmith.com** — weapon builder with hash lookup

Example hashes to get started:
| Item | Hash |
|------|------|
| Gjallarhorn | 1363886209 |
| Ace of Spades | 347366834 |
| Helm of Saint-14 | 3174300811 |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, React Router, Context API |
| Backend | Flask, SQLAlchemy, Flask-JWT-Extended |
| Database | SQLite |
| Gear Data | Bungie Manifest API (free) |
| AI | Groq API — Llama 3.3 70B (free) |

---

## 🧠 Data Models

- **User** — id, username, email, password_hash
- **Build** — id, title, description, role, subclass, activity, is_public, user_id
- **GearItem** — id, bungie_hash, name, slot, tier, icon_url, stats, perks
- **BuildItem** — id, build_id, gear_item_id, slot_label (junction table)

---

## ✨ Features

- 🔐 Full JWT authentication (register, login, logout)
- 🏗️ Create and edit builds with class, subclass, and activity
- ⚔️ Add gear to 8 slots using Bungie item hashes
- 🤖 AI-powered build analysis via Groq (Llama 3.3)
- 🌐 Share builds publicly and browse community builds
- 🔍 Filter community builds by class and activity
- 🗑️ Full CRUD on builds and gear items