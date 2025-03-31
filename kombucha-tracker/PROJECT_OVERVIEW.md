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
- [ ] Implement offline persistence

### Backend Migration (Supabase + Prisma)
- [ ] Create Supabase project (User Action)
- [ ] Set up Supabase environment variables (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.) (User Action)
- [ ] Remove Firebase dependencies
- [ ] Add Prisma and Supabase dependencies
- [ ] Define Prisma schema (`schema.prisma`)
- [ ] Run initial database migration (`prisma migrate dev`)
- [ ] Generate Prisma Client (`prisma generate`)
- [ ] Initialize Supabase client
- [ ] Refactor Authentication (AuthService, useAuth, components) for Supabase Auth
- [ ] Refactor Repository/Service Layer (Remove Firebase Repos, Use Prisma Client in Services)
- [ ] Refactor Seeding (SeedService)
- [ ] Integrate Zod validation (as needed)
- [ ] Update documentation (Architecture, README)

### Data Layer (Post-Migration)
- [ ] Design/Confirm relational data structure (Prisma Schema)
- [ ] Implement data access logic (Prisma Client)
- [ ] Set up real-time sync (Supabase Realtime)
- [ ] Implement batch code system
- [ ] Implement equipment tracking
- [ ] Implement container management

### Core Features (Post-Migration)
- [ ] Authentication flow (Supabase)
- [ ] Dashboard view
- [ ] Batch creation form
- [ ] Batch detail view
- [ ] Checklist component
- [ ] Log entry interface
- [ ] Timeline guidance
- [ ] Equipment management
- [ ] Batch transfer interface
- [ ] Quality control tracking
- [ ] Recall management
- [ ] Admin user management
  - [ ] User CRUD operations
  - [ ] Role-based access control
  - [ ] User activity monitoring
  - [ ] User access restrictions

### Polish & Optimization
- [ ] Mobile responsiveness
- [ ] Offline support
- [ ] Data export/import
- [ ] Error handling
- [ ] Loading states
- [ ] Batch lineage visualization
- [ ] Quality control reports
- [ ] Recall tracking system

---

## 🧱 Current App Structure (Refactoring In Progress)

- **Frontend**: React + Vite + TypeScript
- **UI Framework**: Tailwind CSS (mobile-first)
- **State Management**: Zustand
- **Authentication**: ~~Firebase Auth~~ -> Supabase Auth
- **Data Storage**: ~~Firebase Realtime Database~~ -> Supabase (PostgreSQL)
- **ORM**: Prisma
- **Deployment**: GitHub Pages

---

## ✅ Features (MVP - Refactoring In Progress)

- [ ] Authentication flow (Supabase)
- [ ] Protected routes
- [ ] Dashboard with active batches
- [ ] Phase-specific task checklists
- [ ] Batch log entry UI (pH, temp, notes)
- [ ] Batch creation form
- [ ] Timeline guidance (auto next steps)
- [ ] Cross-device sync via Supabase
- [ ] Offline support
- [ ] Export to CSV or JSON format
- [ ] Batch code system
- [ ] Equipment tracking
- [ ] Quality control logging
- [ ] Basic recall management

---

## 🔜 Near-Term Plans

- **Complete Supabase/Prisma Migration:**
  - [ ] Finalize Prisma schema
  - [ ] Refactor Auth, Services, Stores
  - [ ] Implement Seeding
- [ ] Build a **batch logging interface** (pH, temp, flavor notes)
- [ ] Add a **batch timeline engine** based on fermentation start date
- [ ] Implement **batch creation/editing**
- [ ] Implement offline-first functionality with Supabase sync
- [ ] Create equipment management interface
- [ ] Implement batch transfer system
- [ ] Add quality control tracking
- [ ] Set up recall management
- [ ] Implement admin user management system
  - [ ] Set up user roles and permissions
  - [ ] Create user management interface
  - [ ] Implement user activity tracking

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
- **Implement Account Linking:** Allow users to link multiple sign-in providers (Google, GitHub, etc.) to a single user account to prevent duplicates.

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
