# TaskFlow — Task Management API

A production-ready Node.js/Express REST API with JWT authentication, role-based access control, MongoDB persistence, and a built-in Tailwind CSS dashboard.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET

# 3. Run (development)
npm run dev

# 4. Open dashboard
open http://localhost:5000
```

## API Reference

### Auth — `/api/v1/auth`
| Method | Path        | Auth | Description           |
|--------|-------------|------|-----------------------|
| POST   | /register   | ❌   | Create account        |
| POST   | /login      | ❌   | Sign in, get JWT      |
| GET    | /me         | ✅   | Get current user      |
| POST   | /refresh    | ✅   | Re-issue token        |

### Tasks — `/api/v1/tasks`
| Method | Path          | Auth | Description                    |
|--------|---------------|------|--------------------------------|
| GET    | /             | ✅   | List tasks (paginated, filtered)|
| POST   | /             | ✅   | Create task                    |
| GET    | /stats        | ✅   | Aggregated task stats          |
| GET    | /:id          | ✅   | Get single task                |
| PUT    | /:id          | ✅   | Full update                    |
| PATCH  | /:id/status   | ✅   | Quick status change            |
| DELETE | /:id          | ✅   | Delete task                    |

### Users — `/api/v1/users` (admin only)
| Method | Path                | Auth      | Description          |
|--------|---------------------|-----------|----------------------|
| GET    | /                   | ✅ admin  | List all users       |
| GET    | /:id                | ✅ admin  | Get user by ID       |
| PATCH  | /:id/role           | ✅ admin  | Update user role     |
| PATCH  | /:id/toggle-status  | ✅ admin  | Activate/suspend     |
| DELETE | /:id                | ✅ admin  | Delete user + tasks  |

## Query Parameters (GET /tasks)

| Param      | Values                           | Description         |
|------------|----------------------------------|---------------------|
| status     | todo, in-progress, review, done  | Filter by status    |
| priority   | low, medium, high, critical      | Filter by priority  |
| search     | string                           | Full-text search    |
| tags       | comma-separated strings          | Filter by tags      |
| page       | integer (default: 1)             | Pagination          |
| limit      | integer 1–100 (default: 20)      | Results per page    |
| sortBy     | createdAt, dueDate, priority...  | Sort field          |
| order      | asc, desc (default: desc)        | Sort direction      |

## Project Structure

```
task-api/
├── server.js              # Entry point
├── config/db.js           # MongoDB connection
├── models/
│   ├── User.model.js      # User schema + bcrypt hooks
│   └── Task.model.js      # Task schema + indexes + virtuals
├── controllers/
│   ├── auth.controller.js
│   ├── task.controller.js
│   └── user.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── task.routes.js
│   └── user.routes.js
├── middleware/
│   ├── auth.middleware.js    # JWT verify + RBAC
│   ├── error.middleware.js   # Global error handler
│   └── validate.middleware.js
├── validators/
│   ├── auth.validators.js
│   └── task.validators.js
└── public/
    └── dashboard.html     # Single-file Tailwind UI
```

## Environment Variables

| Variable        | Required | Default       | Description            |
|-----------------|----------|---------------|------------------------|
| PORT            | No       | 5000          | Server port            |
| MONGODB_URI     | **Yes**  | —             | MongoDB connection URL  |
| JWT_SECRET      | **Yes**  | —             | JWT signing secret     |
| JWT_EXPIRES_IN  | No       | 7d            | Token lifetime         |
| NODE_ENV        | No       | development   | Environment mode       |
| CLIENT_ORIGIN   | No       | *             | CORS allowed origin    |

## Scalability Note:
To handle a high volume of traffic and ensure system reliability, I would implement:

# 1 Caching: 
Integrate Redis to cache frequently accessed data (like the Task list) to reduce database load.

# 2 Database Optimization: 
Implement indexing on userId and role fields to speed up query execution.

# 3 Load Balancing: 
Use Nginx or a Cloud Load Balancer to distribute traffic across multiple instances of the Node.js server.

# 4 Containerization: 
Use Docker to ensure consistent environments and easy scaling across different cloud providers.