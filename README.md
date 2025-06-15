# 🔥 LeetShaastra 🔥

**LeetShaastra** is a DSA (Data Structures & Algorithms) problem-solving platform that helps developers improve their coding skills through structured challenges, real-time progress tracking, and collaborative learning. Built with a powerful tech stack and a bold mission — to make DSA fun, focused, and effective.

---

## 🧠 About the Project

LeetShaastra provides a focused environment to:
- 🧩 Solve DSA problems categorized by topic and difficulty
- 📈 Track your progress and performance over time
- 💬 Collaborate and discuss problems with peers
- 🏆 Join challenges and climb the leaderboard *(coming soon)*

---

## ⚙️ Tech Stack

| Layer      | Tech        |
|------------|-------------|
| Frontend   | React.js, Tailwind CSS |
| Backend    | Node.js, Express.js    |
| Database   | PostgreSQL             |
| ORM        | Prisma ORM             |
| Auth       | JWT / Auth0 *(optional)* |
| Hosting    | Not dicided yet |

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Prantor-Das/LeetShaastra.git
cd LeetShaastra
```

### 2. Install dependencies

**Backend**
```bash
cd backend
npm install
```

**Frontend**
```bash
cd frontend
npm install
```

### 3. Set up the database

Make sure PostgreSQL is running.

Create a `.env` file inside the `server` folder and add:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/LeetShaastra"
PORT=5000
JWT_SECRET=your_jwt_secret
```

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## ▶️ Running the App

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

App should now be live at `http://localhost:8080`

---

## 📸 Preview

> ![LeetShaastra Logo](assets/Logo.jpg)  
> *"Solve DSA, Build Skills."*

---

## 🚧 Folder Structure

```
LeetShaastra/
├── frontend/         # React Frontend
│   └── assets/
│   └── src/
├── backend/  
│   ├── prisma/ 
│   └── src/
│   ├── .env/ 
│   └── nodemodule/
└── README.md
```

## 📜 License

MIT License  
© 2025 [Prantor / Team LeetShaastra]

---

## ❤️ Credits

- Prisma & PostgreSQL for the robust backend
- React + Tailwind for sleek UI
- OpenAI for idea shaping
- Judge0 for Code execution
- DSA communities for inspiration

---

**LeetShaastra – Learn, Solve, Conqure.**
