# 🧭 Career Compass (TalentSync-AI)

An AI-powered job portal frontend designed to streamline profile registration, job matching, and career guidance. Built with React and TypeScript, it features a clean, responsive UI with dark theme styling.

---

## ✨ Features

* **User Registration**: Register user profiles with skills, preferred roles, and experience levels, persisting a unique `user_id` locally.
* **Smart Job Matching**: Fetch personalized job recommendations based on user profiles and skills.
* **AI Career Guidance**: Ask career-related questions and receive tailored insights from AI agents.
* **Modern UI & UX**: Clean, responsive layout with dark theme support, smooth hover animations, and loading feedback.

---

## 🛠️ Tech Stack

* **Automation Backend**: n8n Webhooks
* **Frontend**: React, TypeScript,
* **Styling**: Tailwind CSS
* **Build Tool & Runtime**: Vite, Node.js


---

## 📂 Project Structure

```text
TalentSync-AI/
├── public/              # Static assets and icons
├── src/                 # Application source code
│   ├── components/      # Reusable UI components
│   ├── pages/           # Application views (Home, Register, Jobs, Guidance)
│   └── routes/          # Navigation and route definitions
├── package.json         # Project dependencies and scripts
└── vite.config.ts       # Vite configuration
