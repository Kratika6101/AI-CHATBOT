#  AI Chatbot

An AI-powered chatbot built using **React.js**, **Node.js**, **Express.js**, and **Google Gemini API**. The chatbot provides fast, intelligent, and interactive responses through a clean and responsive user interface.

##  Features

-  Real-time AI conversations
-  Powered by Google Gemini API
-  Modern and responsive UI
-  Mobile-friendly design
-  Loading animations
-  Error handling
-  Chat history support
-  Secure API key management using environment variables

##  Tech Stack

### Frontend
- React.js
- Vite
- Axios
- CSS

### Backend
- Node.js
- Express.js
- Google Gemini API
- dotenv
- CORS

##  Project Structure

```
AI-CHATBOT/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/AI-CHATBOT.git
cd AI-CHATBOT
```

### Install Frontend

```bash
cd client
npm install
```

### Install Backend

```bash
cd ../server
npm install
```

##  Environment Variables

Create a `.env` file inside the **server** folder.

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-latest
PORT=5000
```

Create a `.env` file inside the
