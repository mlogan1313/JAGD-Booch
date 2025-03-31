# Kombucha Tracker App – Project Context

## 🎯 Goal

Build a professional-grade web app for tracking daily kombucha production, using a brewery-like workflow focused on repeatability, cleanliness, and scale.

---

## 📋 Project Checklist

### Setup & Infrastructure
- [x] Initialize Git repository
- [x] Set up GitHub repository
- [x] Configure SSH authentication
- [x] Set up GitHub Pages
- [x] Initialize React project with Vite
- [x] Configure TypeScript
- [x] Set up Tailwind CSS
- [x] Configure project structure
- [x] Install Firebase dependencies
- [x] Create Firebase project
- [x] Configure Firebase Authentication
- [x] Set up Firebase Realtime Database
- [x] Configure Firebase Security Rules
- [ ] Implement offline persistence

### Data Layer
- [x] Design Firebase data structure
- [x] Implement Firebase data storage
- [ ] Set up offline-first functionality
- [x] Create data utilities
- [x] Implement real-time sync

### Core Features
- [x] Authentication flow (Firebase)
- [x] Dashboard view
- [ ] Batch creation form
- [ ] Batch detail view
- [x] Checklist component
- [ ] Log entry interface
- [ ] Timeline guidance

### Polish & Optimization
- [x] Mobile responsiveness
- [ ] Offline support
- [ ] Data export/import
- [x] Error handling
- [x] Loading states

---

## 🧱 Current App Structure

- **Frontend**: React + Vite + TypeScript
- **UI Framework**: Tailwind CSS (mobile-first)
- **State Management**: Zustand + Firebase
- **Authentication**: Firebase Auth
- **Data Storage**: Firebase Realtime Database
- **Deployment**: GitHub Pages
- **Daily Dashboard**: Lists active batches with day count and stage
- **Checklist View**: Per-batch interactive tasks for each phase

---

## ✅ Features (MVP)

- [x] Firebase Authentication
- [x] Protected routes
- [x] Dashboard with active batches
- [x] Phase-specific task checklists
- [ ] Batch log entry UI (pH, temp, notes)
- [ ] Batch creation form
- [ ] Timeline guidance (auto next steps)
- [x] Cross-device sync via Firebase
- [ ] Offline support with Firebase persistence
- [ ] Export to CSV or JSON format

---

## 🔜 Near-Term Plans

- [x] Set up Firebase project and configuration
- [x] Configure Firebase Security Rules for data access
- [ ] Build a **batch logging interface** (pH, temp, flavor notes)
- [ ] Add a **batch timeline engine** based on fermentation start date
- [ ] Implement **batch creation/editing**
- [ ] Implement offline-first functionality with Firebase sync

---

## 🧪 Long-Term Goals

- Full fermentation lifecycle tracking (1F → 2F → Kegging)
- Sensor integration down the line (pH/temp, optional)
- Mobile PWA support
- CSV/Markdown export
- Advanced flavor analysis + scaling plans

---

## 💡 Inspiration + Foundation

- Kombucha batches are managed like beer: tea steeping, sugar loading, fermentation, flavoring, carbonation
- Current flavors: LimeAid and POG
- Using a 20-gallon kettle (1F) + two 5-gal conical fermenters (2F)
- Manual logging is preferred initially, with eventual sensor automation (e.g. pH/temp probes or BrewPi-like integrations)
- Cross-device access is essential: desktop for full management, mobile for brewery operations
- Single-user application with data stored in Firebase

---

## 📁 Project Structure

```plaintext
kombucha-tracker/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   ├── BatchCard.tsx
│   │   ├── Checklist.tsx
│   │   └── LogForm.tsx
│   ├── pages/
│   │   ├── index.tsx  (Dashboard)
│   │   ├── auth/
│   │   │   ├── index.tsx
│   │   │   └── callback.tsx
│   │   └── batch/[id].tsx (Batch detail view)
│   ├── services/
│   │   ├── firebase.ts
│   │   └── auth.ts
│   ├── stores/
│   │   └── batchStore.ts
│   ├── utils/
│   │   └── batchHelpers.ts
│   └── types/
│       └── batch.ts
├── public/
└── package.json
```
