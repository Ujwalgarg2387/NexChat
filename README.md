# 💬 NexChat — Real-Time Chat Application

A full-stack, WhatsApp-style real-time chat app with end-to-end encrypted messages, file sharing, group chats, and live typing indicators.

---

## 🚀 Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | React 18 + Vite, TailwindCSS, Zustand           |
| Backend      | Java 17, Spring Boot 3.2, Spring Security       |
| Database     | MongoDB                                         |
| Real-time    | WebSocket (STOMP over SockJS)                   |
| Auth         | JWT (Access + Refresh tokens)                   |
| Encryption   | AES-256-GCM (server-side, per message)          |

---

## ✨ Features

- 🔐 **Authentication** — Signup/login with email & password, JWT + refresh tokens
- 💬 **1-on-1 Chat** — Private conversations between users
- 👥 **Group Chat** — Create/join groups, add/remove members, rename
- 🔍 **Search Users** — Find users by name or email
- 📁 **File Sharing** — Images, videos, and documents (with previews)
- 🔒 **E2E Encryption** — All text messages encrypted with AES-256-GCM before storing
- 🟢 **Online Presence** — Real-time online/offline indicators
- ✍️ **Typing Indicator** — Live "is typing..." signal via WebSocket
- 📜 **Chat History** — Persistent message history with clear option
- ✅ **Read Receipts** — Double-tick message status
- 🗑️ **Delete Messages** — Delete your own messages

---

## 📁 Project Structure

```
nexchat/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/nexchat/
│   │   ├── config/             # Security, WebSocket config
│   │   ├── controller/         # REST API endpoints
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── exception/          # Global error handling
│   │   ├── model/              # MongoDB documents
│   │   ├── repository/         # MongoDB repositories
│   │   ├── security/           # JWT, filters
│   │   ├── service/            # Business logic
│   │   ├── util/               # Encryption utility
│   │   └── websocket/          # WebSocket controller
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── static/uploads/     # Uploaded files
│   ├── .env                    # Backend environment variables
│   └── pom.xml
│
└── frontend/                   # React + Vite application
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── chat/           # ChatWindow, MessageBubble, etc.
    │   │   ├── common/         # Avatar, LoadingScreen
    │   │   ├── group/          # CreateGroupModal
    │   │   └── user/           # SearchUsers, ProfilePanel
    │   ├── context/            # Zustand stores
    │   ├── pages/              # LoginPage, SignupPage, ChatPage
    │   ├── services/           # API client, WebSocket service
    │   └── App.jsx
    ├── .env                    # Frontend environment variables
    └── package.json
```

---

## ⚙️ Prerequisites

- **Java 17+** (JDK)
- **Maven 3.8+**
- **Node.js 18+** and npm/yarn
- **MongoDB** (local or Atlas cloud)

---

## 🛠️ Setup & Run

### 1. MongoDB

Start MongoDB locally:
```bash
mongod --dbpath /data/db
```
Or use [MongoDB Atlas](https://www.mongodb.com/atlas) and copy the connection URI.

---

### 2. Backend

```bash
cd nexchat/backend

# Copy and configure environment
cp .env .env.local   # edit values as needed

# Run with Maven
./mvnw spring-boot:run
# Or on Windows:
mvnw.cmd spring-boot:run
```

Backend starts at: `http://localhost:8080`

**Key `.env` settings:**
```env
MONGODB_URI=mongodb://localhost:27017/nexchat
JWT_SECRET=your-secret-key-min-32-chars
ENCRYPTION_KEY=YourEncryptionKey32CharactersLong
CORS_ORIGINS=http://localhost:5173
```

---

### 3. Frontend

```bash
cd nexchat/frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env .env.local   # edit if backend is on a different host/port

# Start dev server
npm run dev
```

Frontend starts at: `http://localhost:5173`

---

## 🔒 Security Notes

### JWT Tokens
- **Access token**: short-lived (default 24h), sent via `Authorization: Bearer` header
- **Refresh token**: long-lived (7 days), rotated on each use, stored in MongoDB

### Message Encryption
- All text messages are encrypted server-side with **AES-256-GCM** before being stored
- Each message has a unique random IV (Initialization Vector)
- Messages are decrypted on the fly when retrieved via the API
- The encryption key should be rotated periodically in production

---

## 📡 API Reference

### Auth
| Method | Endpoint             | Description       |
|--------|----------------------|-------------------|
| POST   | /api/auth/signup     | Register new user |
| POST   | /api/auth/login      | Login             |
| POST   | /api/auth/refresh    | Refresh JWT       |
| POST   | /api/auth/logout     | Logout            |

### Users
| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| GET    | /api/users/me        | Get current user       |
| GET    | /api/users/search    | Search users by name   |
| PUT    | /api/users/profile   | Update profile         |

### Chats
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/chats                      | Access/create 1-on-1     |
| GET    | /api/chats                      | Get all user chats       |
| POST   | /api/chats/group                | Create group             |
| PUT    | /api/chats/group/:id/add        | Add member               |
| PUT    | /api/chats/group/:id/remove     | Remove member            |
| PUT    | /api/chats/group/:id/rename     | Rename group             |
| DELETE | /api/chats/:id                  | Delete chat              |

### Messages
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| POST   | /api/messages               | Send message        |
| GET    | /api/messages/:chatId       | Get chat history    |
| PUT    | /api/messages/:chatId/read  | Mark as read        |
| DELETE | /api/messages/:chatId/clear | Clear history       |
| DELETE | /api/messages/message/:id   | Delete single msg   |

### Files
| Method | Endpoint                         | Description    |
|--------|----------------------------------|----------------|
| POST   | /api/files/upload                | Upload file    |
| GET    | /api/files/view/:subDir/:name    | Download/view  |

---

## 🌐 WebSocket (STOMP)

**Connect:** `ws://localhost:8080/ws`  
**Auth header:** `Authorization: Bearer <token>`

| Destination                    | Direction | Description           |
|--------------------------------|-----------|-----------------------|
| /app/typing                    | Send      | Typing event          |
| /app/online                    | Send      | Mark user online      |
| /app/offline                   | Send      | Mark user offline     |
| /topic/chat/{chatId}           | Subscribe | New messages          |
| /topic/chat/{chatId}/typing    | Subscribe | Typing indicators     |
| /topic/presence                | Subscribe | Online/offline events |

---

## 🐳 Docker (Optional)

```yaml
# docker-compose.yml (add to project root)
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/nexchat
      JWT_SECRET: change-me-in-production
      ENCRYPTION_KEY: NexChatKey32BytesLongChangeMeNow!
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

---

## 📝 License

MIT © NexChat
