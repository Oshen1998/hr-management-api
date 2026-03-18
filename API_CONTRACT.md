# API Contract — HR Management Platform

**Version:** 1.0
**Base URL:** `http://localhost:3000/api` (configurable via `VITE_API_URL`)
**Content-Type:** `application/json`
**Authentication:** Bearer token — `Authorization: Bearer <accessToken>`

---

## Table of Contents

1. [Global Conventions](#1-global-conventions)
2. [Enums Reference](#2-enums-reference)
3. [Shared Schemas](#3-shared-schemas)
4. [Auth](#4-auth)
5. [Employees](#5-employees)
6. [Leave Management](#6-leave-management)
7. [Payroll](#7-payroll)
8. [Performance](#8-performance)
9. [Recruitment](#9-recruitment)
10. [Notifications](#10-notifications)
11. [Audit Logs](#11-audit-logs)
12. [Analytics](#12-analytics)
13. [Error Responses](#13-error-responses)

---

## 1. Global Conventions

### Authentication
Every endpoint except `POST /auth/login` requires a valid Bearer token in the `Authorization` header.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens expire. When the server returns `401`, the client will automatically attempt a refresh via `POST /auth/refresh`. If refresh also fails, the user is logged out.

### Pagination
Endpoints that return lists support these query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | `1` | Page number (1-based) |
| `pageSize` | `number` | `20` | Items per page |

Paginated responses always follow this envelope:

```typescript
interface PaginatedResponse<T> {
  data: T[]
  total: number       // total matching records
  page: number
  pageSize: number
  totalPages: number
}
```

### Date Format
All dates are **ISO 8601 strings** (`YYYY-MM-DD` for date-only, `YYYY-MM-DDTHH:mm:ssZ` for datetime).

### ID Format
All `id` fields are strings (UUID v4 recommended).

---

## 2. Enums Reference

All enum values are **uppercase strings**. The backend must validate that only valid enum values are accepted and return `400` for invalid values.

### UserRole
```
ADMIN | HR_MANAGER | MANAGER | EMPLOYEE
```

### Department
```
ENGINEERING | PRODUCT | DESIGN | MARKETING | SALES |
HR | FINANCE | OPERATIONS | LEGAL | CUSTOMER_SUCCESS
```

### EmploymentStatus
```
ACTIVE | ON_LEAVE | TERMINATED | ON_PROBATION
```

### EmploymentType
```
FULL_TIME | PART_TIME | CONTRACT | INTERN
```

### Gender
```
MALE | FEMALE | NON_BINARY | PREFER_NOT_TO_SAY
```

### LeaveType
```
ANNUAL | SICK | MATERNITY | PATERNITY | UNPAID | COMPENSATORY | BEREAVEMENT
```

### LeaveStatus
```
PENDING | APPROVED | REJECTED | CANCELLED
```

### PayrollStatus
```
DRAFT | PROCESSING | APPROVED | PAID
```

### GoalStatus
```
DRAFT | ACTIVE | COMPLETED | CANCELLED
```

### ReviewStatus
```
NOT_STARTED | IN_PROGRESS | SUBMITTED | COMPLETED
```

### ApplicationStage
```
APPLIED | SCREENING | INTERVIEW | OFFER | HIRED | REJECTED
```

### JobStatus
```
OPEN | PAUSED | CLOSED | DRAFT
```

### NotificationType
```
LEAVE_REQUEST | LEAVE_APPROVED | LEAVE_REJECTED | PAYROLL_PROCESSED |
REVIEW_DUE | ONBOARDING_TASK | BIRTHDAY | CONTRACT_EXPIRY |
PROBATION_END | OFFER_ACCEPTED | SYSTEM
```

### AuditAction
```
CREATE | UPDATE | DELETE | LOGIN | LOGOUT | APPROVE | REJECT
```

---

## 3. Shared Schemas

### Employee (embedded/partial)
Many resources embed a partial employee object. The minimum shape used across the codebase:
```typescript
{
  id: string
  firstName: string
  lastName: string
  avatarUrl?: string
  department?: Department  // included where relevant
}
```

---

## 4. Auth

### `POST /auth/login`

Authenticates a user and returns tokens.

**Auth required:** No

**Request Body:**
```typescript
{
  email: string     // required, valid email
  password: string  // required, min 8 chars
}
```

**Response `200`:**
```typescript
{
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole          // "ADMIN" | "HR_MANAGER" | "MANAGER" | "EMPLOYEE"
    avatarUrl?: string
    employeeId?: string     // present for non-admin users linked to an employee record
  },
  tokens: {
    accessToken: string     // JWT, short-lived (15–60 min)
    refreshToken: string    // opaque token, long-lived (7–30 days)
    expiresIn: number       // access token TTL in seconds
  }
}
```

---

### `POST /auth/logout`

Invalidates the refresh token server-side.

**Auth required:** Yes

**Request Body:** _(empty)_

**Response `204`:** No content

---

### `POST /auth/refresh`

Issues a new access token using a valid refresh token.

**Auth required:** No

**Request Body:**
```typescript
{
  refreshToken: string  // required
}
```

**Response `200`:**
```typescript
{
  accessToken: string
  refreshToken: string  // may be rotated
}
```

---

## 5. Employees

### `GET /employees`

Returns a paginated, filterable list of employees.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `page` | `number` | No | Default: `1` |
| `pageSize` | `number` | No | Default: `20` |
| `search` | `string` | No | Full-text search on `firstName`, `lastName`, `email`, `position` |
| `department` | `Department` | No | Filter by department |
| `status` | `EmploymentStatus` | No | Filter by employment status |
| `employmentType` | `EmploymentType` | No | Filter by employment type |

**Response `200`:** `PaginatedResponse<Employee>`

```typescript
{
  data: Employee[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

Where `Employee` is:
```typescript
{
  id: string
  employeeNumber: string         // system-generated, e.g. "EMP-0042"
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatarUrl?: string
  department: Department
  position: string               // job title
  managerId?: string
  manager?: {
    id: string
    firstName: string
    lastName: string
  }
  employmentType: EmploymentType
  employmentStatus: EmploymentStatus
  gender: Gender
  dateOfBirth?: string           // YYYY-MM-DD
  hireDate: string               // YYYY-MM-DD
  terminationDate?: string       // YYYY-MM-DD, only if TERMINATED
  salary: number
  currency: string               // ISO 4217, e.g. "USD"
  location?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
    email?: string
  }
  createdAt: string              // ISO datetime
  updatedAt: string              // ISO datetime
}
```

---

### `GET /employees/:id`

Returns a single employee by ID.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Employee UUID |

**Response `200`:** Full `Employee` object (same shape as above)

**Response `404`:** Employee not found

---

### `POST /employees`

Creates a new employee. The backend auto-generates `id`, `employeeNumber`, `createdAt`, `updatedAt`.

**Request Body:**
```typescript
{
  firstName: string              // required
  lastName: string               // required
  email: string                  // required, unique
  phone?: string
  department: Department         // required
  position: string               // required
  employmentType: EmploymentType // required
  employmentStatus: EmploymentStatus  // required — typically "ON_PROBATION" on creation
  gender: Gender                 // required
  hireDate: string               // required, YYYY-MM-DD
  salary: number                 // required, >= 0
  currency: string               // required, default "USD"
  location?: string
  dateOfBirth?: string
  managerId?: string
  avatarUrl?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
    email?: string
  }
}
```

**Response `201`:** Full `Employee` object

---

### `PATCH /employees/:id`

Partially updates an employee record.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Employee UUID |

**Request Body:** Any subset of Employee fields (all optional):
```typescript
{
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  department?: Department
  position?: string
  employmentType?: EmploymentType
  employmentStatus?: EmploymentStatus
  gender?: Gender
  dateOfBirth?: string
  hireDate?: string
  terminationDate?: string
  salary?: number
  currency?: string
  location?: string
  managerId?: string
  avatarUrl?: string
  address?: { street: string; city: string; state: string; country: string; postalCode: string }
  emergencyContact?: { name: string; relationship: string; phone: string; email?: string }
}
```

**Response `200`:** Updated full `Employee` object

---

### `DELETE /employees/:id`

Soft-deletes or hard-deletes an employee (recommended: soft-delete by setting `employmentStatus: TERMINATED`).

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Employee UUID |

**Response `204`:** No content

---

### `GET /employees/:id/timeline`

Returns employment history events for an employee.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Employee UUID |

**Response `200`:**
```typescript
Array<{
  id: string
  employeeId: string
  type: "HIRED" | "PROMOTED" | "DEPARTMENT_CHANGE" | "SALARY_CHANGE" | "STATUS_CHANGE" | "TITLE_CHANGE"
  date: string               // YYYY-MM-DD
  description: string        // human-readable description
  metadata?: Record<string, unknown>  // e.g. { from: "ENGINEER", to: "SENIOR_ENGINEER" }
}>
```

---

## 6. Leave Management

### `GET /employees/:employeeId/leave-balances`

Returns leave balance summary for a specific employee for the current year.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `employeeId` | `string` | Employee UUID |

**Response `200`:**
```typescript
Array<{
  leaveType: LeaveType
  accrued: number     // days accrued this year
  used: number        // days used this year
  remaining: number   // accrued - used
  year: number        // e.g. 2025
}>
```

---

### `GET /leave-requests`

Returns a paginated list of leave requests.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `employeeId` | `string` | No | Filter by employee |
| `status` | `LeaveStatus` | No | Filter by status |
| `page` | `number` | No | Default: `1` |
| `pageSize` | `number` | No | Default: `20` |

**Response `200`:** `PaginatedResponse<LeaveRequest>`

```typescript
{
  data: Array<{
    id: string
    employeeId: string
    employee?: {
      id: string
      firstName: string
      lastName: string
      avatarUrl?: string
      department: Department
    }
    leaveType: LeaveType
    startDate: string          // YYYY-MM-DD
    endDate: string            // YYYY-MM-DD
    workingDays: number        // backend calculates, excludes weekends & holidays
    reason?: string
    status: LeaveStatus
    approvedBy?: string        // employeeId of approver
    approverComment?: string
    createdAt: string
    updatedAt: string
  }>
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

---

### `GET /leave-requests/pending`

Returns all pending leave requests for a manager's direct reports.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `managerId` | `string` | Yes | employeeId of the manager |

**Response `200`:** `LeaveRequest[]` (array, not paginated — typically small)

Same `LeaveRequest` shape as above.

---

### `POST /employees/:employeeId/leave-requests`

Creates a new leave request on behalf of an employee.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `employeeId` | `string` | Employee UUID |

**Request Body:**
```typescript
{
  leaveType: LeaveType   // required
  startDate: string      // required, YYYY-MM-DD
  endDate: string        // required, YYYY-MM-DD, must be >= startDate
  reason?: string
}
```

**Response `201`:** Full `LeaveRequest` object

**Business Rules:**
- Backend must calculate `workingDays` by counting business days between `startDate` and `endDate`, excluding public holidays.
- Validate that the employee has sufficient `remaining` balance for the given `leaveType`.
- New requests default to `status: PENDING`.

---

### `PATCH /leave-requests/:id/review`

Approve or reject a pending leave request.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | LeaveRequest UUID |

**Request Body:**
```typescript
{
  action: "APPROVE" | "REJECT"  // required
  comment?: string               // required when action is "REJECT"
  reviewerId: string             // required, employeeId of the reviewer
}
```

**Response `200`:** Updated `LeaveRequest` object

**Business Rules:**
- Only `PENDING` requests can be reviewed.
- On `APPROVE`: set `status: APPROVED`, set `approvedBy: reviewerId`, deduct from leave balance.
- On `REJECT`: set `status: REJECTED`, persist `approverComment`.

---

### `PATCH /leave-requests/:id/cancel`

Cancels a pending leave request by the employee.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | LeaveRequest UUID |

**Request Body:** _(empty)_

**Response `200`:** Updated `LeaveRequest` with `status: CANCELLED`

**Business Rules:**
- Only `PENDING` requests can be cancelled.
- If cancelling an already `APPROVED` leave (future start date), restore the balance.

---

### `GET /holidays`

Returns public holidays.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `country` | `string` | No | ISO country code (e.g. `"US"`, `"GB"`). Default: `"US"` |

**Response `200`:**
```typescript
Array<{
  id: string
  name: string
  date: string          // YYYY-MM-DD
  country: string       // ISO country code
  type: "PUBLIC" | "OPTIONAL"
}>
```

---

## 7. Payroll

### `GET /payroll/runs`

Returns all payroll runs, most recent first.

**Response `200`:**
```typescript
Array<{
  id: string
  month: number         // 1–12
  year: number          // e.g. 2025
  status: PayrollStatus
  totalGross: number
  totalNet: number
  totalDeductions: number
  employeeCount: number
  processedAt?: string  // ISO datetime
  approvedBy?: string   // userId
  createdAt: string
}>
```

---

### `GET /payroll/runs/:id`

Returns a single payroll run.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | PayrollRun UUID |

**Response `200`:** Full `PayrollRun` object (same shape as above)

---

### `POST /payroll/runs`

Initiates a new payroll run for a given month/year.

**Request Body:**
```typescript
{
  month: number   // required, 1–12
  year: number    // required, e.g. 2025
}
```

**Response `201`:**
```typescript
{
  id: string
  month: number
  year: number
  status: "DRAFT"         // always starts as DRAFT
  totalGross: number      // calculated from current salary structures
  totalNet: number
  totalDeductions: number
  employeeCount: number
  createdAt: string
}
```

**Business Rules:**
- Only one run per `month + year` combination is allowed.
- Backend calculates gross/net/deductions from active employees and their salary structures.

---

### `PATCH /payroll/runs/:id/approve`

Approves a payroll run for payment.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | PayrollRun UUID |

**Request Body:**
```typescript
{
  approverId: string   // required, userId of approver
}
```

**Response `200`:** Updated `PayrollRun` with `status: APPROVED`

**Business Rules:**
- Only `DRAFT` or `PROCESSING` runs can be approved.
- On approval, generate individual `Payslip` records for each active employee.

---

### `GET /employees/:employeeId/payslips`

Returns paginated payslips for an employee.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `employeeId` | `string` | Employee UUID |

**Query Parameters:** `page`, `pageSize`

**Response `200`:** `PaginatedResponse<Payslip>`

```typescript
{
  data: Array<{
    id: string
    employeeId: string
    employee?: {
      id: string
      firstName: string
      lastName: string
      position: string
      department: Department
    }
    payrollRunId: string
    month: number
    year: number
    grossSalary: number
    netSalary: number
    earnings: Array<{
      name: string    // e.g. "Base Salary", "Overtime"
      amount: number
      type: "EARNING"
    }>
    deductions: Array<{
      name: string    // e.g. "Tax", "Health Insurance"
      amount: number
      type: "DEDUCTION"
    }>
    createdAt: string
  }>
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

---

### `GET /payroll/payslips/:id`

Returns a single payslip by ID.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Payslip UUID |

**Response `200`:** Full `Payslip` object

---

### `GET /payroll/salary-structures`

Returns all defined salary structures.

**Response `200`:**
```typescript
Array<{
  id: string
  name: string
  description?: string
  components: Array<{
    id: string
    name: string
    type: "EARNING" | "DEDUCTION"
    calculationType: "FIXED" | "PERCENTAGE"
    value: number               // fixed amount OR percentage (e.g. 12.5 = 12.5%)
    isDefault: boolean
  }>
  createdAt: string
  updatedAt: string
}>
```

---

### `POST /payroll/salary-structures`

Creates a new salary structure.

**Request Body:**
```typescript
{
  name: string              // required
  description?: string
  components: Array<{
    name: string            // required
    type: "EARNING" | "DEDUCTION"   // required
    calculationType: "FIXED" | "PERCENTAGE"  // required
    value: number           // required
    isDefault: boolean      // required
  }>
}
```

**Response `201`:** Full `SalaryStructure` object

---

## 8. Performance

### `GET /performance/goals`

Returns all goals, optionally filtered by employee.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `employeeId` | `string` | No | Filter goals by owner |

**Response `200`:**
```typescript
Array<{
  id: string
  title: string
  description?: string
  ownerId: string
  owner?: { id: string; firstName: string; lastName: string }
  parentGoalId?: string
  parentGoal?: { id: string; title: string }
  level: "COMPANY" | "TEAM" | "INDIVIDUAL"
  status: GoalStatus
  progress: number          // 0–100 (percentage)
  weight: number            // contribution weight
  targetDate: string        // YYYY-MM-DD
  children?: Goal[]         // nested sub-goals (optional, may be omitted for list views)
  createdAt: string
  updatedAt: string
}>
```

---

### `POST /performance/goals`

Creates a new goal.

**Request Body:**
```typescript
{
  title: string                          // required
  description?: string
  ownerId: string                        // required, employeeId
  parentGoalId?: string                  // for sub-goals (team/individual under company goals)
  level: "COMPANY" | "TEAM" | "INDIVIDUAL"  // required
  status: GoalStatus                     // required, typically "DRAFT"
  progress: number                       // required, 0–100
  weight: number                         // required
  targetDate: string                     // required, YYYY-MM-DD
}
```

**Response `201`:** Full `Goal` object

---

### `PATCH /performance/goals/:id`

Partially updates a goal.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Goal UUID |

**Request Body:** Any subset of goal fields (all optional)

**Response `200`:** Updated `Goal` object

---

### `PATCH /performance/goals/:id/progress`

Updates only the progress percentage of a goal.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Goal UUID |

**Request Body:**
```typescript
{
  progress: number   // required, 0–100
}
```

**Response `200`:** Updated `Goal` object

---

### `GET /performance/review-cycles`

Returns all review cycles.

**Response `200`:**
```typescript
Array<{
  id: string
  name: string
  type: "ANNUAL" | "QUARTERLY" | "PROBATION" | "360"
  startDate: string       // YYYY-MM-DD
  endDate: string         // YYYY-MM-DD
  status: ReviewStatus
  templateId: string      // reference to a ReviewTemplate
  createdAt: string
}>
```

---

### `GET /performance/review-cycles/:id`

Returns a single review cycle.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | ReviewCycle UUID |

**Response `200`:** Full `ReviewCycle` object

---

### `POST /performance/review-cycles`

Creates a new review cycle.

**Request Body:**
```typescript
{
  name: string                                   // required
  type: "ANNUAL" | "QUARTERLY" | "PROBATION" | "360"  // required
  startDate: string                              // required, YYYY-MM-DD
  endDate: string                                // required, YYYY-MM-DD
  status: ReviewStatus                           // required
  templateId: string                             // required
}
```

**Response `201`:** Full `ReviewCycle` object

---

### `GET /performance/review-cycles/:cycleId/reviews`

Returns all performance reviews for a cycle.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `cycleId` | `string` | ReviewCycle UUID |

**Response `200`:**
```typescript
Array<{
  id: string
  cycleId: string
  employeeId: string       // subject of the review
  reviewerId: string       // who is filling it in
  type: "SELF" | "MANAGER" | "PEER"
  status: ReviewStatus
  overallRating?: number   // 1–5
  responses: Array<{
    questionId: string
    answer: string | number
  }>
  comments?: string
  submittedAt?: string     // ISO datetime, null until submitted
  createdAt: string
}>
```

---

### `POST /performance/reviews`

Submits a performance review.

**Request Body:**
```typescript
{
  cycleId: string          // required
  employeeId: string       // required, subject of the review
  reviewerId: string       // required, who submits
  type: "SELF" | "MANAGER" | "PEER"  // required
  status: ReviewStatus     // required, e.g. "SUBMITTED"
  overallRating?: number   // 1–5
  responses: Array<{
    questionId: string
    answer: string | number
  }>
  comments?: string
}
```

**Response `201`:** Full `PerformanceReview` object with `submittedAt` set

---

## 9. Recruitment

### `GET /recruitment/jobs`

Returns all job listings.

**Response `200`:**
```typescript
Array<{
  id: string
  title: string
  department: Department
  location: string
  type: EmploymentType        // FULL_TIME | PART_TIME | CONTRACT | INTERN
  status: JobStatus
  description: string
  requirements: string[]
  salary?: {
    min: number
    max: number
    currency: string          // ISO 4217
  }
  applicantCount: number      // computed — total applicants for this job
  postedAt?: string           // ISO datetime
  closingDate?: string        // YYYY-MM-DD
  createdAt: string
}>
```

---

### `GET /recruitment/jobs/:id`

Returns a single job listing.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Job UUID |

**Response `200`:** Full `Job` object

---

### `POST /recruitment/jobs`

Creates a new job posting.

**Request Body:**
```typescript
{
  title: string               // required
  department: Department      // required
  location: string            // required
  type: EmploymentType        // required
  status: JobStatus           // required, typically "DRAFT" or "OPEN"
  description: string         // required
  requirements: string[]      // required, may be empty array
  salary?: {
    min: number
    max: number
    currency: string
  }
  postedAt?: string
  closingDate?: string
}
```

**Response `201`:** Full `Job` object with `applicantCount: 0`

---

### `PATCH /recruitment/jobs/:id`

Updates a job listing.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Job UUID |

**Request Body:** Any subset of job fields (all optional)

**Response `200`:** Updated `Job` object

---

### `GET /recruitment/applicants`

Returns applicants, optionally filtered by job.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `jobId` | `string` | No | Filter by job posting |

**Response `200`:**
```typescript
Array<{
  id: string
  jobId: string
  job?: { id: string; title: string; department: Department }
  firstName: string
  lastName: string
  email: string
  phone?: string
  source: "LINKEDIN" | "INDEED" | "REFERRAL" | "DIRECT" | "AGENCY" | "OTHER"
  stage: ApplicationStage
  rating?: number             // 1–5
  resumeUrl?: string
  daysInStage: number         // backend-computed — days since last stage change
  notes?: string
  appliedAt: string           // ISO datetime
  updatedAt: string
}>
```

---

### `GET /recruitment/applicants/:id`

Returns a single applicant.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Applicant UUID |

**Response `200`:** Full `Applicant` object

---

### `PATCH /recruitment/applicants/:id/stage`

Moves an applicant to a different pipeline stage.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Applicant UUID |

**Request Body:**
```typescript
{
  stage: ApplicationStage   // required
}
```

**Response `200`:** Updated `Applicant` object with new `stage` and reset `daysInStage: 0`

---

### `PATCH /recruitment/applicants/:id/rating`

Updates the rating for an applicant.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Applicant UUID |

**Request Body:**
```typescript
{
  rating: number   // required, 1–5
}
```

**Response `200`:** Updated `Applicant` object

---

## 10. Notifications

### `GET /notifications`

Returns all notifications for a user.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `userId` | `string` | Yes | User ID to fetch notifications for |

**Response `200`:**
```typescript
Array<{
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  link?: string           // deep link within the app, e.g. "/leave-approvals"
  createdAt: string       // ISO datetime
}>
```

**Note:** Return newest first (`ORDER BY createdAt DESC`).

---

### `PATCH /notifications/:id/read`

Marks a single notification as read.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Notification UUID |

**Request Body:** _(empty)_

**Response `204`:** No content

---

### `PATCH /notifications/read-all`

Marks all unread notifications for a user as read.

**Request Body:**
```typescript
{
  userId: string   // required
}
```

**Response `204`:** No content

---

## 11. Audit Logs

### `GET /audit-logs`

Returns a paginated, filterable audit trail.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `entity` | `string` | No | Entity type: `"Employee"`, `"LeaveRequest"`, `"PayrollRun"`, `"Goal"`, etc. |
| `userId` | `string` | No | Filter by acting user |
| `page` | `number` | No | Default: `1` |
| `pageSize` | `number` | No | Default: `50` |

**Response `200`:** `PaginatedResponse<AuditLog>`

```typescript
{
  data: Array<{
    id: string
    userId: string
    user?: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
    action: AuditAction
    entity: string              // e.g. "Employee", "LeaveRequest"
    entityId: string            // UUID of the affected record
    oldValues?: Record<string, unknown>   // state before the change
    newValues?: Record<string, unknown>   // state after the change
    ipAddress?: string
    createdAt: string           // ISO datetime
  }>
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

**Note:** The backend should automatically write audit log entries for all `CREATE`, `UPDATE`, `DELETE`, `APPROVE`, and `REJECT` operations. No client-initiated write endpoint is needed.

---

## 12. Analytics

All analytics endpoints are read-only and return aggregated, computed data. No request body required.

---

### `GET /analytics/kpis`

Returns current HR KPIs (snapshot of today).

**Response `200`:**
```typescript
{
  totalHeadcount: number        // count of ACTIVE + ON_LEAVE + ON_PROBATION employees
  newHiresMTD: number           // hires this calendar month
  turnoverRate: number          // percentage, e.g. 4.2 (= 4.2%)
  avgTenureMonths: number       // average months since hireDate across active employees
  openPositions: number         // count of jobs with status OPEN
  absenteeismRate: number       // percentage of working days missed this month
}
```

---

### `GET /analytics/headcount-trend`

Returns monthly headcount over time.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `months` | `number` | No | `12` | Number of past months to include |

**Response `200`:**
```typescript
Array<{
  month: string    // "Jan 25", "Feb 25", etc.
  count: number    // headcount at end of that month
}>
```

---

### `GET /analytics/turnover`

Returns monthly voluntary vs involuntary turnover.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `months` | `number` | No | `12` | Number of past months to include |

**Response `200`:**
```typescript
Array<{
  month: string
  voluntary: number     // voluntary terminations
  involuntary: number   // involuntary terminations
}>
```

---

### `GET /analytics/leave-utilization`

Returns leave day usage broken down by leave type (for current year).

**Response `200`:**
```typescript
Array<{
  name: string    // leave type label, e.g. "Annual", "Sick"
  value: number   // total days taken of this type
}>
```

---

### `GET /analytics/payroll-cost-trend`

Returns monthly gross and net payroll cost for the last 6 months.

**Response `200`:**
```typescript
Array<{
  month: string   // "Jan 25", "Feb 25", etc.
  gross: number   // total gross payroll for that month
  net: number     // total net payroll for that month
}>
```

---

### `GET /analytics/department-distribution`

Returns current headcount by department.

**Response `200`:**
```typescript
Array<{
  department: string   // department label, e.g. "Engineering", "Product"
  count: number        // active employees in that department
}>
```

---

## 13. Error Responses

All error responses follow this shape:

```typescript
{
  message: string     // human-readable description
  code?: string       // machine-readable error code (e.g. "EMPLOYEE_NOT_FOUND")
  statusCode: number  // mirrors the HTTP status
}
```

### Common HTTP Status Codes

| Status | Meaning | When |
|---|---|---|
| `200` | OK | Successful GET / PATCH |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE / action with no return value |
| `400` | Bad Request | Validation failure, invalid enum value, missing required field |
| `401` | Unauthorized | Missing or expired token |
| `403` | Forbidden | Valid token but insufficient role/permission |
| `404` | Not Found | Record with given ID does not exist |
| `409` | Conflict | Duplicate (e.g. employee email already exists, payroll run already exists for period) |
| `422` | Unprocessable Entity | Business rule violation (e.g. insufficient leave balance, cannot cancel approved leave) |
| `500` | Internal Server Error | Unexpected server failure |

### Validation Error Example (`400`)
```json
{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "errors": [
    { "field": "email", "message": "Must be a valid email address" },
    { "field": "hireDate", "message": "Required" }
  ]
}
```

---

## Appendix — Quick Reference

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh` | Refresh tokens |
| GET | `/employees` | List employees (paginated + filterable) |
| GET | `/employees/:id` | Get employee |
| POST | `/employees` | Create employee |
| PATCH | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Delete employee |
| GET | `/employees/:id/timeline` | Employee history events |
| GET | `/employees/:id/leave-balances` | Leave balances |
| GET | `/employees/:id/payslips` | Employee payslips |
| GET | `/leave-requests` | List leave requests |
| GET | `/leave-requests/pending` | Pending approvals for manager |
| POST | `/employees/:id/leave-requests` | Submit leave request |
| PATCH | `/leave-requests/:id/review` | Approve / reject leave |
| PATCH | `/leave-requests/:id/cancel` | Cancel leave request |
| GET | `/holidays` | Public holidays |
| GET | `/payroll/runs` | List payroll runs |
| GET | `/payroll/runs/:id` | Get payroll run |
| POST | `/payroll/runs` | Initiate payroll run |
| PATCH | `/payroll/runs/:id/approve` | Approve payroll run |
| GET | `/payroll/payslips/:id` | Get payslip |
| GET | `/payroll/salary-structures` | List salary structures |
| POST | `/payroll/salary-structures` | Create salary structure |
| GET | `/performance/goals` | List goals |
| POST | `/performance/goals` | Create goal |
| PATCH | `/performance/goals/:id` | Update goal |
| PATCH | `/performance/goals/:id/progress` | Update goal progress |
| GET | `/performance/review-cycles` | List review cycles |
| GET | `/performance/review-cycles/:id` | Get review cycle |
| POST | `/performance/review-cycles` | Create review cycle |
| GET | `/performance/review-cycles/:id/reviews` | List reviews for cycle |
| POST | `/performance/reviews` | Submit review |
| GET | `/recruitment/jobs` | List jobs |
| GET | `/recruitment/jobs/:id` | Get job |
| POST | `/recruitment/jobs` | Create job |
| PATCH | `/recruitment/jobs/:id` | Update job |
| GET | `/recruitment/applicants` | List applicants |
| GET | `/recruitment/applicants/:id` | Get applicant |
| PATCH | `/recruitment/applicants/:id/stage` | Move applicant stage |
| PATCH | `/recruitment/applicants/:id/rating` | Update applicant rating |
| GET | `/notifications` | Get notifications for user |
| PATCH | `/notifications/:id/read` | Mark notification read |
| PATCH | `/notifications/read-all` | Mark all notifications read |
| GET | `/audit-logs` | List audit logs |
| GET | `/analytics/kpis` | HR KPIs |
| GET | `/analytics/headcount-trend` | Headcount over time |
| GET | `/analytics/turnover` | Turnover breakdown |
| GET | `/analytics/leave-utilization` | Leave utilization by type |
| GET | `/analytics/payroll-cost-trend` | Payroll cost over time |
| GET | `/analytics/department-distribution` | Headcount by department |
