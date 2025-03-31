# Kombucha Tracker App Issues Checklist

## Schema and Type Mismatches

- [ ] **Fix schema and type definitions mismatch**
  - The `Batch` type in `types/batch.ts` doesn't match the `BatchSchema` in `schemas/batch.ts`
  - The Zod schema defines fields like `metadata`, `recipe`, and `currentStage`, while the TypeScript interface has a flatter structure
  - Update either the Zod schema or the TypeScript types to ensure they're consistent

- [ ] **Update enum usage**
  - Ensure all string literal types in `types/batch.ts` are replaced with proper enum references
  - Use the defined enums (`StageEnum`, `EquipmentTypeEnum`, etc.) consistently throughout the codebase
  - Check for "magic quotes" in component files where enum values might be hardcoded

## Firebase Data Structure

- [ ] **Validate Firebase data structure**
  - Check if the data being saved to Firebase matches the expected schema
  - Ensure the path structure in repositories matches what Firebase expects
  - Verify Firebase security rules allow the necessary operations

## Service Initialization

- [ ] **Fix service initialization**
  - The `SeedService` gets initialized with user ID, but batch data might not be visible
  - Check if `BatchService` is being properly initialized with the user ID in `App.tsx`
  - Ensure `useBatchStore` is correctly setting the batch service
  - [ ] **Revisit `useEquipmentStore` initialization:** Current implementation calls `getInstance/initialize` in every action. Attempts to refactor like `useBatchStore` failed due to complex type errors. Keep current implementation for now but investigate later.

## Authentication Flow

- [ ] **Check authentication flow**
  - Verify that user authentication is working correctly
  - Ensure user ID is being passed to services after login
  - Check if auth state persistence is configured properly

## Data Fetching

- [ ] **Troubleshoot data fetching**
  - Check if `fetchBatches` in the batch store is being called after seeding
  - Add logging to batch service to see if data is being fetched but not displayed
  - Verify the query for fetching batches includes the correct user ID filter

## Seeding Functionality

- [ ] **Test seeding functionality**
  - Verify that the seeding process completes successfully without errors
  - Check admin page to ensure seed button works
  - Inspect Firebase database directly to see if seeded data exists

- [ ] **Update seeding to match current schema**
  - The seed data in `seedService.ts` might not follow the updated schema
  - Ensure seeded data has all required fields

## Component Rendering

- [ ] **Check component rendering**
  - Verify that `BatchCard` component correctly displays batch data
  - Ensure the dashboard handles empty state correctly
  - Check for any UI issues when displaying batches

## Repository Layer

- [ ] **Verify repository operations**
  - Check if `BaseRepository` is correctly validating data with Zod schemas
  - Verify that `create`, `update`, and `getAll` methods are working correctly
  - Ensure error handling is properly implemented

## Environment Variables

- [ ] **Validate environment setup**
  - Confirm all required Firebase environment variables are set
  - Check if Firebase is initialized correctly in `firebase.ts`
  - Verify the database connection is working

## Real-time Updates

- [ ] **Set up real-time data listeners**
  - Implement or fix real-time listeners for Firebase data changes
  - Ensure stores are updated when Firebase data changes
  - Add error handling for disconnections

## Developer Tools

- [ ] **Use developer tools for debugging**
  - Add temporary debug logging to track data flow
  - Use Firebase console to directly inspect database
  - Check browser console for errors

## Testing Plan

- [ ] **Create a testing plan**
  - Implement a clear sequence of operations to test:
    1. Login
    2. Seed data
    3. Verify data appears
    4. Create new batch
    5. Update batch
    6. Delete batch
  - Document any failures in the sequence 