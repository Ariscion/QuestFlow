# 🎮 VELO

> A modern game deal aggregator with multi-region support, PWA capabilities, and Telegram integration.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

[🇷🇺 Читать на русском](README.ru.md)

## 🎯 Overview

VELO helps gamers find the best deals across multiple digital stores. It features dynamic currency conversion based on user location and integrates seamlessly with Telegram as a Mini App.

## ✨ Key Features

*   **🕹️ Multi-Store Aggregation**: Real-time prices from various stores via CheapShark API.
*   **🌍 Smart Localization**: Automatic currency detection and conversion (RUB, KZT, USD) based on IP geolocation.
*   **📱 PWA Support**: Installable on desktop and mobile with offline fallback capability.
*   **🤖 Telegram Integration**: Works as a Telegram Mini App with bot notifications for wishlisted games.
*   **🎨 Premium UI/UX**: Glassmorphic design, smooth animations, and dark mode.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **State Management**: Zustand (Client state), TanStack Query v5 (Server state)
*   **Styling**: Custom Glassmorphic System / Vanilla CSS
*   **Backend & DB**: Firebase (Auth, Firestore)
*   **Integrations**: Telegram WebApp SDK
*   **Automation**: GitHub Actions

## 📸 Interface (Screenshots & GIF)

### 🏠 Home & Library
| Home | Library |
| :---: | :---: |
| ![Home](./assets/home.png) | ![Library](./assets/library.png) |

### 🔍 Search & Settings
| Search | Settings |
| :---: | :---: |
| ![Search](./assets/search.png) | ![Settings](./assets/settings.png) |

### 🔔 Notifications & PWA
| Notifications | Download / PWA |
| :---: | :---: |
| ![Notifications](./assets/alerts.png) | ![Download](./assets/download.png) |

### 🎥 Demonstration (GIF)
![Search Demo](./assets/searching_gif.gif)

## 🚀 Getting Started

### Prerequisites
*   Node.js v18+
*   npm or yarn

### Installation
1. Clone the repo: `git clone https://github.com/Ariscion/VELO.git`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in the values.
4. Run dev server: `npm run dev`

## 🔗 Links

👉 [VELO Web App](https://velo-app.web.app)

👉 [VELO Telegram Bot](https://t.me/quflow_bot)

---
