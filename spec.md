# Blood Bank Donation System

## Current State

A full-stack blood bank donation system with:
- Donor registration with eligibility checks (age 18-65, weight >= 50kg, health status)
- Blood inventory management for all 8 blood types (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Emergency blood request system
- Appointment booking
- Donation history tracking
- Admin dashboard
- In-app notifications
- Search by blood type and location
- Role-based access: guests, users (donors), admins

## Requested Changes (Diff)

### Add
- Seed all 8 blood types in blood inventory on initialization (starting at 0 units each)

### Modify
- Fix eligibility check: `isEligible` should compare `healthStatus` case-insensitively (or normalize to lowercase before checking), so "Healthy", "healthy", "HEALTHY" all pass. The frontend sends "Healthy" but the current backend checks for "healthy".
- Fix `getAppointments` and `getMyAppointments`: use `Array.sort` with `Appointment.compare` comparator instead of calling `.sort()` with no argument
- The `UserProfile` type keeps `weight` and `healthStatus` as optional fields (`?Nat`, `?Text`)
- The `registerDonor` function should store the `contact` field -- add `contact: Text` parameter so the profile is complete in one call (no need for a separate `saveCallerUserProfile` call just to set contact)
- `saveCallerUserProfile` must continue to accept the full `UserProfile` including optional weight/healthStatus

### Remove
- Nothing removed

## Implementation Plan

1. Backend (Motoko):
   - Initialize `bloodInventory` by seeding all 8 blood types with 0 units in a `do` block after state declarations
   - Fix eligibility: use `Text.toLowercase(healthStatus) == "healthy"` in the `registerDonor` function
   - Fix sort calls: replace `appointments.toArray().sort()` with `Array.sort(appointments.toArray(), Appointment.compare)` for both `getAppointments` and `getMyAppointments`
   - Add `contact: Text` parameter to `registerDonor` and save it in the `UserProfile` created inside `registerDonor`
   - Keep all other functions and types unchanged

2. Frontend:
   - In `RegisterPage.tsx`, remove the separate `saveCallerUserProfile` call -- `registerDonor` now handles the contact field too. Pass `contact` to `registerDonor`.
   - Update `useRegisterDonor` mutation in `useQueries.ts` to include `contact` parameter
   - Ensure `ProfileSetupModal.tsx` still works (it only needs name, so no change needed there)
