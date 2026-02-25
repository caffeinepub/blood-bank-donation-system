# Blood Bank Donation Management System

## Current State

This is a new project with basic Caffeine boilerplate structure. No existing features have been implemented yet.

## Requested Changes (Diff)

### Add

**User Management:**
- Donor registration system with name, age, blood group, contact details, and location
- Secure login system for donors and admin users
- Role-based access control (donor vs admin roles)
- Default admin account creation

**Donor Features:**
- Donor profile management
- Eligibility checking system (age 18-65, weight requirements, health conditions)
- Donation history tracking for each donor
- Appointment booking system with date and time slot selection
- View personal donation records

**Blood Inventory System:**
- Blood stock management for all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Stock tracking with quantities
- Admin capabilities to add, update, increase, or decrease blood stock levels

**Search & Discovery:**
- Search available blood by blood group type
- Search donors by location (city/area)
- Filter and display compatible donors

**Emergency Request System:**
- Public emergency blood request submission (no login required)
- Request tracking with blood type, location, and urgency details
- Admin dashboard view of all emergency requests
- Request status management

**Admin Dashboard:**
- Comprehensive admin panel
- Manage all donors (view, approve, deactivate)
- Manage blood stock inventory
- View and respond to emergency requests
- Manage appointment slots and availability
- Generate reports

**Reporting:**
- Total donors count and statistics
- Blood stock levels report
- Emergency requests report
- Donation history reports

**Notifications:**
- In-app notification system for donation reminders
- Notifications for emergency blood needs matching donor blood type
- Appointment confirmation notifications

### Modify

No existing features to modify.

### Remove

No existing features to remove.

## Implementation Plan

**Backend (Motoko):**
1. User authentication and authorization system with donor and admin roles
2. Donor registration and profile management APIs
3. Eligibility checking logic (age, weight, health validation)
4. Blood inventory management system with CRUD operations
5. Search APIs for blood groups and donors by location
6. Emergency request submission and management system
7. Appointment booking system with slot management
8. Donation history recording and retrieval
9. Notification system for in-app alerts
10. Report generation APIs for statistics and data
11. Admin dashboard data aggregation APIs

**Frontend (React + TypeScript + Tailwind):**
1. Landing page with application overview
2. User registration and login pages
3. Donor dashboard showing profile, eligibility status, donation history
4. Blood search interface (by type and location)
5. Emergency request submission form (public access)
6. Appointment booking interface with calendar and time slots
7. Admin dashboard with multiple sections:
   - Donor management table
   - Blood stock management interface
   - Emergency requests queue
   - Appointment management
   - Reports and statistics view
8. Notification center/panel for in-app alerts
9. Profile management pages
10. Responsive design for all screens

**Data Models:**
- User (donor/admin with profile details)
- BloodStock (blood type, quantity, last updated)
- DonationRecord (donor, date, blood type, location)
- EmergencyRequest (patient info, blood type needed, location, urgency, status)
- Appointment (donor, date, time slot, status, location)
- Notification (user, message, type, read status, timestamp)

## UX Notes

**User Flow - Donor:**
1. Register with personal details and blood group
2. Complete eligibility check
3. View dashboard with donation history and notifications
4. Search for blood availability or nearby donors
5. Book appointment for donation
6. Receive notifications for donation reminders

**User Flow - Admin:**
1. Login with admin credentials (default: username "admin")
2. Access comprehensive dashboard
3. Manage blood inventory (add/update stock levels)
4. Review and respond to emergency requests
5. Manage donor approvals and profiles
6. Configure appointment slots
7. Generate and view reports

**User Flow - Public (Emergency Request):**
1. Access emergency request form without login
2. Submit blood request with required details
3. Receive confirmation

**Design Principles:**
- Clean, medical-themed interface with professional color scheme
- Clear visual hierarchy for critical information (blood types, emergency requests)
- Easy-to-use forms with validation
- Mobile-responsive design
- Accessible color contrasts for readability
- Quick access to search and emergency features
- Dashboard widgets for key statistics
- Data tables with sorting and filtering capabilities
