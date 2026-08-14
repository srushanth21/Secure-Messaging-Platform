# Secure Messaging Platform

A comprehensive full-stack clone of the modern Signal Desktop messaging application. This project features a clean, privacy-focused interface, real-time messaging, group chats, and a pristine light-theme aesthetic.

##  Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router), React
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Real-Time**: Native WebSocket API

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite with SQLAlchemy (Async)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-Time**: FastAPI WebSockets

### Deployment
- **Containerization**: Docker & Docker Compose

## 🏗 Architecture Overview

The application follows a standard modern client-server architecture with real-time capabilities:

1. **REST API**: Handles stateless operations including authentication (login/register), fetching historical messages, managing user profiles, creating groups, and contact management.
2. **WebSocket Manager**: Maintains an active, stateful connection with authenticated clients. It handles the real-time broadcasting of new messages, typing indicators, read receipts, and online presence. The in-memory connection manager routes payloads to the specific `ConversationMembers`.
3. **Database Layer**: Asynchronous SQLite operations using `SQLAlchemy`. Complex relations (like eager loading members and their user profiles) are handled efficiently via `selectinload`.
4. **Client State**: Zustand stores provide reactive global state for UI configuration (like the settings modal), Authentication (JWT tokens), and Chat state (websocket connections, current conversation data).

## 🗄 Database Schema

The relational database is built on 5 primary models:

1. **Users**: Stores credentials, profile data (`display_name`, `avatar_url`), and online presence (`is_online`, `last_seen`).
2. **Contacts**: A self-referential mapping to manage a user's address book (`user_id` -> `contact_user_id`).
3. **Conversations**: Represents a chat thread. Includes `type` (`direct` or `group`), and optional metadata for groups (`name`, `avatar_url`).
4. **Conversation Members**: Maps users to conversations. Includes `role` (admin/member) and `last_read_at` (used for read receipts and unread badge counts).
5. **Messages**: Stores the actual chat data. Linked to a conversation and a sender. Includes `content`, `status` (sent/delivered/read), and timestamp indexing for performant querying.

## 🚀 Implemented Signal Features (Evaluation Guide)

This application strictly implements core features of the modern Signal Desktop experience. Here is an overview of the functionality available for evaluation:

### 1. Authentication & User Profiles
- **Secure JWT Auth**: Users can sign up and log in securely. Sessions are persisted.
- **Global Profile Settings**: Click your Avatar in the top-left Navigation Rail to view Profile settings (Display Name, Username) and adjust Privacy/Notification toggles.

### 2. Contacts Management
- **Adding Contacts**: Click the "New Chat" button (pencil icon) in the Sidebar header. You will see a list of all registered users on the platform. Clicking on any user automatically adds them to your contacts and initializes a direct 1:1 conversation.
- **Contact Directory**: Once added, users appear in your contact list for quick access.

### 3. Real-Time Conversation List
- **Dynamic Sorting**: The sidebar automatically sorts conversations based on the most recent activity (newest messages bubble to the top).
- **Unread Indicators**: Conversations with unread messages are highlighted with bold text and an unread badge counter.
- **Typing Indicators**: Real-time typing dots appear in the conversation list when the other party is drafting a message.

### 4. 1:1 & Group Messaging
- **Creating a Group**: Click the "New Group" button (users icon) in the Sidebar header. Enter a group name, optionally select an avatar, and check the boxes next to the contacts you wish to invite.
- **Group Administration**: Group creators act as Admins. By clicking the Group Header in an active chat, you can view the Group Details Modal. From here, Admins can add new members or remove existing members.
- **System Messages**: The chat stream automatically renders inline system messages (e.g., "Alice created the group", "Bob was added to the group") to maintain an audit trail of group activity.

### 5. Chat Experience
- **Signal UI Aesthetics**: Implements Signal's pristine light-theme aesthetic, including horizontal inline timestamps, subtle bubble shadows, dynamic border-radii for grouped messages, and a dedicated far-left Navigation Rail.
- **Message Grouping**: Consecutive messages from the same sender within a 5-minute window are visually grouped together (the tail is hidden and borders are rounded), matching Signal's exact spacing and layout rules.
- **Delivery & Read Receipts**: Messages display real-time status icons. A single checkmark indicates the message reached the server; a double checkmark indicates it was delivered to the recipient's active client; filled-in checkmarks indicate the message was read.

## ⚙️ Assumptions & Trade-offs

- **Single Node Real-Time**: The WebSocket connection manager uses an in-memory dictionary. While highly performant for a single instance, scaling the backend horizontally across multiple containers would require migrating the Pub/Sub layer to Redis.
- **SQLite**: Used for extreme portability and zero-config local setup. In a production environment, this would be swapped to PostgreSQL.
- **Client-Side Auth Storage**: JWT tokens are stored in `localStorage`. While standard for SPAs, using `httpOnly` cookies is generally recommended for stricter XSS protection in production.
- **Theme**: To perfectly mimic the requested Signal UI aesthetic, Dark Mode has been explicitly disabled in favor of a highly-polished, high-contrast Light Theme.
- **Placeholders**: To maintain the exact UI layout of Signal Desktop, the left Navigation Rail includes icons for "Calls" and "Status" which act as UI placeholders. 

## 🛠 Setup Instructions

### Option 1: Docker (Recommended)

You can easily run the entire application using Docker Compose. Ensure Docker Desktop is running.

```bash
docker-compose up --build
```
This will:
- Build the Python backend image.
- Automatically run the seed script to populate the database with test data.
- Expose the FastAPI backend at `http://localhost:8000`.
- Build the Next.js frontend and expose it at `http://localhost:3000`.

### Option 2: Local Development (Without Docker)

**1. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

**2. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🧪 Default Test Users

The database is pre-seeded with several test users to easily explore the application without signing up. The password for **all** test users is: `password123`.

Available test users (login via username):
- `alice`
- `bob`
- `charlie`
- `diana`
- `eve`
- `frank`

Feel free to open multiple incognito windows, log in as different users, and test the real-time messaging and group features!
