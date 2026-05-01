# 💬 NexChat

NexChat is a full-stack, WhatsApp-style real-time chat app built with React and Spring Boot. It supports 1-on-1 chats and group chats, live typing indicators, online presence, and file sharing — all backed by end-to-end encrypted messages.

---

## 📸 Screenshots

| Login | Sign Up |
|-------|---------|
| <img src="https://github.com/user-attachments/assets/d0563d02-4a2d-4a61-bd22-a74e34619cc3" width="750"/> | <img src="https://github.com/user-attachments/assets/74abe43e-7125-4959-9361-49f0284df772" width="750"/> |

| 1v1 Chat | Group Chat |
|----------|------------|
| <img src="https://github.com/user-attachments/assets/ebb3c47e-a1f5-40ec-8d22-cc0c7b84f28f" width="750"/> | <img src="https://github.com/user-attachments/assets/75a36a8e-5545-4d7e-8fc5-4aaa060e36fd" width="750"/> |
---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite, TailwindCSS, Zustand |
| Backend | Java 17, Spring Boot 3.2, Spring Security |
| Database | MongoDB |
| Real-time | WebSocket (STOMP over SockJS) |
| Auth | JWT (Access + Refresh tokens) |
| Encryption | AES-256-GCM (per message) |

---

## ✨ Features

- 🔐 JWT auth with refresh tokens
- 💬 1-on-1 and 👥 group chats
- 📁 File sharing (images, videos, documents)
- 🔒 AES-256-GCM message encryption
- 🟢 Online presence & ✍️ typing indicators
- ✅ Read receipts & 🗑️ message deletion

---

## ⚙️ Prerequisites

- Java 17+ (JDK)
- Maven 3.8+
- Node.js 18+ with npm
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

---

## 🛠️ Setup

### 1. MongoDB

**Local:** `mongod --dbpath /data/db`

**Or** use [MongoDB Atlas](https://www.mongodb.com/atlas) and grab your connection URI.

---

### 2. Backend

```bash
cd nexchat/backend
```

Create a `.env` file with:

```env
MONGODB_URI=mongodb://localhost:27017/nexchat   #create cluster wither from mongodb atlas or download mongodb compass and then copy the url here.
JWT_SECRET=your-secret-key-min-32-chars
ENCRYPTION_KEY=YourEncryptionKey32CharactersLong
CORS_ORIGINS=http://localhost:5173
```

Then run:

```bash
# Linux/macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

Backend will start at **`http://localhost:8080`**

---

### 3. Frontend

```bash
cd nexchat/frontend
npm install
npm run dev
```

Frontend will start at **`http://localhost:5173`**

> Make sure the backend is running before you open the frontend.

---

## 📁 Project Structure

```
nexchat/
├── backend/
│   └── src/main/java/com/nexchat/
│       ├── config/        # Security & WebSocket config
│       ├── controller/    # REST endpoints
│       ├── model/         # MongoDB documents
│       ├── service/       # Business logic
│       ├── security/      # JWT & filters
│       └── websocket/     # WebSocket controller
│
└── frontend/
    └── src/
        ├── components/    # UI components (chat, auth, group)
        ├── context/       # Zustand stores
        ├── pages/         # LoginPage, SignupPage, ChatPage
        └── services/      # API client & WebSocket service
```

---

## 🔒 Security Notes

- **Access token** — 24h lifetime, sent via `Authorization: Bearer` header
- **Refresh token** — 7-day lifetime, rotated on each use, stored in MongoDB
- **Messages** — encrypted with AES-256-GCM before storage; each has a unique IV

---

## 🐳 Docker (Optional)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]

  backend:
    build: ./backend
    ports: ["8080:8080"]
    environment:
      MONGODB_URI: mongodb://mongodb:27017/nexchat
      JWT_SECRET: change-me-in-production
      ENCRYPTION_KEY: NexChatKey32BytesLongChangeMeNow!
    depends_on: [mongodb]

  frontend:
    build: ./frontend
    ports: ["5173:80"]
    depends_on: [backend]

volumes:
  mongo_data:
```

Run with: `docker compose up --build`

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/chats` | Get all chats |
| POST | `/api/chats/group` | Create group |
| GET | `/api/messages/:chatId` | Get messages |
| POST | `/api/messages` | Send message |
| POST | `/api/files/upload` | Upload file |

**WebSocket:** Connect to `ws://localhost:8080/ws` with `Authorization: Bearer <token>`

---
