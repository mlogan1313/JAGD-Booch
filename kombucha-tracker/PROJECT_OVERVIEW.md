# Kombucha Tracker App – Project Context

## 🎯 Goal

Build a professional-grade web app for tracking daily kombucha production, using a brewery-like workflow focused on repeatability, cleanliness, and scale.

---

## 📋 Project Checklist

### Setup & Infrastructure
- [x] Initialize Git repository
- [x] Set up GitHub repository
- [x] Configure SSH authentication
- [ ] Set up GitHub Pages
- [ ] Initialize React project with Vite
- [ ] Configure TypeScript
- [ ] Set up Tailwind CSS
- [ ] Configure project structure

### Data Layer
- [ ] Design JSON data structure
- [ ] Implement GitHub data storage
- [ ] Set up local storage sync
- [ ] Create data utilities

### Core Features
- [ ] Dashboard view
- [ ] Batch creation form
- [ ] Batch detail view
- [ ] Checklist component
- [ ] Log entry interface
- [ ] Timeline guidance

### Polish & Optimization
- [ ] Mobile responsiveness
- [ ] Offline support
- [ ] Data export/import
- [ ] Error handling
- [ ] Loading states

---

## 🧱 Current App Structure

- **Frontend**: React + Vite + TypeScript
- **UI Framework**: Tailwind CSS (mobile-first)
- **State Management**: React Context + Local Storage
- **Data Storage**: GitHub (JSON files) + Local Storage
- **Deployment**: GitHub Pages
- **Daily Dashboard**: Lists active batches with day count and stage
- **Checklist View**: Per-batch interactive tasks for each phase

---

## ✅ Features (MVP)

- [x] Dashboard with active batches
- [x] Phase-specific task checklists
- [ ] Batch log entry UI (pH, temp, notes)
- [ ] Batch creation form
- [ ] Timeline guidance (auto next steps)
- [ ] Cross-device sync via GitHub
- [ ] Offline support with local storage
- [ ] Export to CSV or GitHub-friendly format

---

## 🔜 Near-Term Plans

- Set up GitHub-based data storage
- Build a **batch logging interface** (pH, temp, flavor notes)
- Add a **batch timeline engine** based on fermentation start date
- Implement **batch creation/editing**
- Implement offline-first functionality with GitHub sync

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
- Single-user application with data stored in GitHub

---

## 📁 Project Structure

```plaintext
kombucha-tracker/
├── src/
│   ├── components/
│   │   ├── BatchCard.tsx
│   │   ├── Checklist.tsx
│   │   └── LogForm.tsx
│   ├── pages/
│   │   ├── index.tsx  (Dashboard)
│   │   └── batch/[id].tsx (Batch detail view)
│   ├── utils/
│   │   ├── batchHelpers.ts
│   │   └── githubSync.ts
│   └── data/
│       └── mockBatches.ts
├── data/
│   └── batches/
│       └── [batch-specific JSON files]
├── public/
└── package.json
```
