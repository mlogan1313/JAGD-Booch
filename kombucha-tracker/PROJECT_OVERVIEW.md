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
- [x] Implement batch code system
- [x] Set up equipment tracking
- [x] Implement container management

### Core Features
- [x] Authentication flow (Firebase)
- [x] Dashboard view
- [ ] Batch creation form
- [ ] Batch detail view
- [x] Checklist component
- [ ] Log entry interface
- [ ] Timeline guidance
- [x] Equipment management
- [ ] Batch transfer interface
- [ ] Quality control tracking
- [ ] Recall management
- [ ] Admin user management
  - [ ] User CRUD operations
  - [ ] Role-based access control
  - [ ] User activity monitoring
  - [ ] User access restrictions

### Polish & Optimization
- [x] Mobile responsiveness
- [ ] Offline support
- [ ] Data export/import
- [x] Error handling
- [x] Loading states
- [ ] Batch lineage visualization
- [ ] Quality control reports
- [ ] Recall tracking system

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
- **Equipment Management**: 
  - Track kettles, fermenters, and containers
  - Equipment scheduling and availability
  - Maintenance and cleaning tracking
  - Container status management
- **Batch Tracking**: Complete lineage from 1F to retail

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
- [x] Batch code system
- [x] Equipment tracking
- [ ] Quality control logging
- [ ] Basic recall management

---

## 🔜 Near-Term Plans

- [x] Set up Firebase project and configuration
- [x] Configure Firebase Security Rules for data access
- [ ] Build a **batch logging interface** (pH, temp, flavor notes)
- [ ] Add a **batch timeline engine** based on fermentation start date
- [ ] Implement **batch creation/editing**
- [ ] Implement offline-first functionality with Firebase sync
- [x] Create equipment management interface
- [ ] Implement batch transfer system
- [ ] Add quality control tracking
- [ ] Set up recall management
- [ ] Implement admin user management system
  - [ ] Set up user roles and permissions
  - [ ] Create user management interface
  - [ ] Implement user activity tracking
  - [ ] Configure access control rules

---

## 🧪 Long-Term Goals

- Full fermentation lifecycle tracking (1F → 2F → Kegging/Bottling)
- Sensor integration down the line (pH/temp, optional)
- Mobile PWA support
- CSV/Markdown export
- Advanced flavor analysis + scaling plans
- Advanced quality control analytics
- Automated batch code generation
- Equipment maintenance scheduling
- Retail distribution tracking
- Customer feedback integration

---

## 💡 Inspiration + Foundation

- Kombucha batches are managed like beer: tea steeping, sugar loading, fermentation, flavoring, carbonation
- Current flavors: LimeAid and POG
- Using a 20-gallon kettle (1F) + two 5-gal conical fermenters (2F)
- Manual logging is preferred initially, with eventual sensor automation (e.g. pH/temp probes or BrewPi-like integrations)
- Cross-device access is essential: desktop for full management, mobile for brewery operations
- Single-user application with data stored in Firebase
- Complete traceability from 1F to retail
- Quality control and recall management capabilities
- Role-based access control needed for:
  - System administrators (full access)
  - Brewers (standard operations)
  - Quality control (read-only quality data)
  - Inventory management (read-only inventory)
  - Public access (limited data)

---

## 📁 Project Structure

```plaintext
kombucha-tracker/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   ├── BatchCard.tsx
│   │   ├── Checklist.tsx
│   │   ├── LogForm.tsx
│   │   ├── EquipmentList.tsx
│   │   ├── ContainerList.tsx
│   │   ├── AddEquipmentForm.tsx
│   │   ├── AddContainerForm.tsx
│   │   └── Navigation.tsx
│   ├── pages/
│   │   ├── index.tsx  (Dashboard)
│   │   ├── auth/
│   │   │   ├── index.tsx
│   │   │   └── callback.tsx
│   │   ├── batch/[id].tsx (Batch detail view)
│   │   └── equipment/index.tsx (Equipment management)
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── batchService.ts
│   │   └── equipmentService.ts
│   ├── stores/
│   │   ├── batchStore.ts
│   │   └── equipmentStore.ts
│   ├── utils/
│   │   ├── batchHelpers.ts
│   │   └── batchCodeGenerator.ts
│   └── types/
│       ├── batch.ts
│       ├── equipment.ts
│       └── quality.ts
├── public/
└── package.json
```
