# 🤖 AI Tools Hub - Community Platform for AI Tools Discovery

> A modern full-stack platform for discovering, sharing, and reviewing AI tools. Built with Laravel, Next.js, and modern web technologies.

📋 **[Project Summary](docs/PROJECT_SUMMARY.md)** | ⚡ **[Quick Start](docs/QUICKSTART.md)** | 📖 **[Full Guide](docs/IMPLEMENTATION_GUIDE.md)**

---

## ✨ Features

### 🔐 Authentication & Security
- **Email-based 2FA** - Secure two-factor authentication via email
- **Trusted Devices** - "Remember this device for 30 days" functionality
- **Role-based Access Control** - Admin, Moderator, and User roles
- **Audit Logging** - Complete activity tracking for compliance

### �️ AI Tools Management
- **Tool Submission** - Users can submit AI tools for review
- **Approval Workflow** - Moderators and admins review submissions
- **Advanced Search** - Filter by category, tags, pricing, features
- **Ratings & Reviews** - Community-driven tool evaluation
- **Smart Slug Generation** - Auto-incrementing slugs prevent duplicates

### 📊 Admin Dashboard
- **User Management** - Role assignment and user administration
- **Tool Moderation** - Approve, reject, or archive submissions
- **Audit Logs** - View all system activities
- **Real-time Notifications** - Instant updates for new submissions
- **Statistics** - Tool and user analytics

### 💬 Community Features
- **Comments** - Discussion on each tool
- **Ratings** - 5-star rating system
- **Notifications** - Real-time updates (5-second polling)

## � Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tsvetoslav-toshev/AI-Tools-Hub-Project.git
   cd AI-Tools-Hub-Project
   ```

2. **Start the environment:**
   ```bash
   docker compose up -d
   ```

3. **Run database migrations and seeders:**
   ```bash
   docker compose exec php_fpm php artisan migrate --seed
   ```

4. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **API Status**: http://localhost:8080/api/status

### Default Users

After seeding, you can login with:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | alexandra@admin.local | password | Full system access |
| **Moderator** | ivan@moderator.local | password | Tool moderation |
| **Frontend Dev** | elena@frontend.local | password | Standard user |
| **Backend Dev** | petar@backend.local | password | Standard user |

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Modern minimalist design system
- **State**: React Hooks

### Backend
- **Framework**: Laravel 11
- **Language**: PHP 8.2
- **API**: RESTful JSON API
- **Authentication**: Laravel Sanctum
- **Queue**: Redis-backed jobs

### Infrastructure
- **Database**: MySQL 8.0
- **Cache**: Redis 7
- **Web Server**: Nginx
- **Containerization**: Docker Compose

## 📁 Project Structure

```
AI-Tools-Hub-Project/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   └── components/   # Reusable components
│   └── package.json
├── backend/              # Laravel application
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
├── docs/                 # Documentation
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── AI_TOOLS_HUB.md
│   └── DESIGN_SYSTEM.md
├── docker/              # Docker configurations
├── nginx/               # Nginx config
└── docker-compose.yml

```

## 🎯 How to Submit a Tool

### For Users

1. **Register/Login:**
   - Visit http://localhost:3000
   - Click "Login" or register a new account
   - Complete 2FA verification (check email for code)

2. **Navigate to Submit Tool:**
   - Click "Submit Tool" in navigation
   - Or visit: http://localhost:3000/tools/add

3. **Fill in Tool Details:**
   ```
   Required Fields:
   - Tool Name
   - Description (min 50 characters)
   - Website URL
   - Category (select from dropdown)
   - Pricing Type (Free, Freemium, Paid)
   
   Optional Fields:
   - Logo URL
   - Tags (AI, ML, NLP, etc.)
   - Features
   - Use Cases
   - Real Examples
   ```

4. **Submit for Review:**
   - Click "Submit Tool"
   - Tool status: **Pending**
   - Admin/Moderator receives notification
   - Wait for approval (check notifications)

5. **After Approval:**
   - Tool becomes **Active**
   - Visible on homepage and browse page
   - Users can rate and comment

### For Moderators/Admins

1. **Review Submissions:**
   - Login as admin/moderator
   - Visit: http://localhost:3000/admin/tools
   - View pending submissions

2. **Approve/Reject:**
   - Click on tool to review
   - **Approve** - Tool goes live
   - **Reject** - Tool hidden, submitter notified
   - **Archive** - Soft delete

## 🔐 Role-Based Access Control

### Permissions Overview

| Feature | User | Moderator | Admin |
|---------|------|-----------|-------|
| **Authentication** |
| Login with 2FA | ✅ | ✅ | ✅ |
| Trust device (30 days) | ✅ | ✅ | ✅ |
| **Tools** |
| View public tools | ✅ | ✅ | ✅ |
| Submit new tool | ✅ | ✅ | ✅ |
| Edit own tool | ✅ | ✅ | ✅ |
| Delete own tool | ✅ | ✅ | ✅ |
| Approve/reject tools | ❌ | ✅ | ✅ |
| Archive tools | ❌ | ✅ | ✅ |
| Bulk approve/reject | ❌ | ✅ | ✅ |
| **Comments & Ratings** |
| Add comments | ✅ | ✅ | ✅ |
| Rate tools | ✅ | ✅ | ✅ |
| Edit own comments | ✅ | ✅ | ✅ |
| Delete any comment | ❌ | ✅ | ✅ |
| **Admin Panel** |
| View admin dashboard | ❌ | ❌ | ✅ |
| User management | ❌ | ❌ | ✅ |
| Assign roles | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |
| View statistics | ❌ | ✅ | ✅ |
| **Notifications** |
| Receive notifications | ✅ | ✅ | ✅ |
| Tool approval alerts | ❌ | ✅ | ✅ |
| New submission alerts | ❌ | ✅ | ✅ |

### Role Descriptions

**👤 User (Standard)**
- Can browse and search tools
- Submit tools for review
- Rate and comment on tools
- Manage own submissions

**👨‍💼 Moderator**
- All User permissions
- Review and approve/reject tool submissions
- Moderate comments
- View moderation statistics
- Bulk operations on tools

**👑 Admin (Owner)**
- All Moderator permissions
- Full user management
- Assign/remove roles
- View complete audit logs
- Access system statistics
- Manage categories and tags

## 🔧 Management Scripts

### Quick Commands

```bash
# Start all services
docker compose up -d

# Stop all services  
docker compose down

# View logs
docker compose logs -f

# Restart services
docker compose restart
```

### Development Scripts

- **`start.sh`** - Start environment with auto-setup
- **`stop.sh`** - Stop all services
- **`db-manage.sh`** - Database utilities (connect, backup, redis)
- **`laravel-setup.sh`** - Laravel initialization

## 💻 Development Workflow

### Frontend Development

```bash
# Access frontend container
docker compose exec frontend sh

# Install packages
docker compose exec frontend npm install <package>

# View logs
docker compose logs frontend -f
```

### Backend Development

```bash
# Access PHP container
docker compose exec php_fpm sh

# Run migrations
docker compose exec php_fpm php artisan migrate

# Seed database
docker compose exec php_fpm php artisan db:seed

# Run tests
docker compose exec php_fpm php artisan test

# Create controller
docker compose exec php_fpm php artisan make:controller ToolController

# Clear caches
docker compose exec php_fpm php artisan cache:clear
docker compose exec php_fpm php artisan config:clear
```

### Database Management

```bash
# Connect to MySQL
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass

# Connect to Redis
docker compose exec redis redis-cli -a vibecode-full-stack-starter-kit_redis_pass

# Create backup
./db-manage.sh backup

# Import backup
docker compose exec -T mysql mysql -u root -p < backup.sql
```

## 🔐 Environment Configuration

### Backend (.env)

Key environment variables in `backend/.env`:

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=vibecode-full-stack-starter-kit_app
DB_USERNAME=root
DB_PASSWORD=vibecode-full-stack-starter-kit_mysql_pass

REDIS_HOST=redis
REDIS_PASSWORD=vibecode-full-stack-starter-kit_redis_pass

SESSION_DRIVER=redis
CACHE_STORE=redis
```

### Frontend

Frontend uses `NEXT_PUBLIC_API_URL` environment variable:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
```

## 🧪 Testing

```bash
# Run all tests
docker compose exec php_fpm php artisan test

# Run specific test suite
docker compose exec php_fpm php artisan test --testsuite=Feature

# Run with coverage
docker compose exec php_fpm php artisan test --coverage
```

### Available Test Suites

- **AuditLoggingTest** - Audit trail functionality
- **CommentTest** - Comments system
- **NotificationTest** - Real-time notifications
- **RatingTest** - Rating system
- **RoleBasedAccessControlTest** - Permissions
- **ToolApprovalWorkflowTest** - Tool moderation
- **TrustedDeviceTest** - Device trust functionality
- **TwoFactorAuthenticationTest** - 2FA system

## 🌐 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | Login with email/password | No |
| POST | `/logout` | Logout current session | Yes |
| GET | `/me` | Get current user info | Yes |
| GET | `/users` | List all users | No |

### 2FA Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/2fa/send` | Request 2FA code via email | Yes |
| POST | `/2fa/verify` | Verify 2FA code | Yes |
| GET | `/2fa/status` | Check 2FA verification status | Yes |
| GET | `/2fa/trusted-devices` | List trusted devices | Yes |
| DELETE | `/2fa/trusted-devices/{id}` | Revoke specific device | Yes |
| DELETE | `/2fa/trusted-devices` | Revoke all devices | Yes |

### Tools Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tools` | List all tools (with filters) | No |
| GET | `/tools/{id}` | Get tool details | No |
| POST | `/tools` | Submit new tool | Yes |
| PUT | `/tools/{id}` | Update tool | Yes |
| DELETE | `/tools/{id}` | Delete tool | Yes |
| POST | `/tools/{id}/approve` | Approve tool | Admin/Mod |
| POST | `/tools/{id}/feature` | Feature tool | Admin/Mod |

### Categories & Tags

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | List all categories | No |
| GET | `/categories/{id}` | Get category details | No |
| GET | `/tags` | List all tags | No |
| GET | `/tags/{id}` | Get tag details | No |
| POST | `/tags` | Create new tag | Yes |

### Ratings & Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tools/{id}/ratings` | Get tool ratings | No |
| POST | `/tools/{id}/ratings` | Rate a tool | Yes |
| GET | `/tools/{id}/ratings/user` | Get user's rating | Yes |
| DELETE | `/ratings/{id}` | Delete rating | Yes |
| GET | `/tools/{id}/comments` | Get tool comments | No |
| POST | `/tools/{id}/comments` | Add comment | Yes |
| PUT | `/comments/{id}` | Update comment | Yes |
| DELETE | `/comments/{id}` | Delete comment | Yes |

### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get user notifications | Yes |
| GET | `/notifications/unread-count` | Get unread count | Yes |
| POST | `/notifications/{id}/read` | Mark as read | Yes |
| POST | `/notifications/read-all` | Mark all as read | Yes |

### Admin Endpoints

**Prefix:** `/admin` (Requires Admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users with roles |
| GET | `/admin/users/{id}` | Get user details |
| POST | `/admin/users/{id}/assign-role` | Assign role to user |
| POST | `/admin/users/{id}/remove-role` | Remove role from user |
| GET | `/admin/audit-logs` | View audit logs |
| GET | `/admin/tools` | View all tools (including pending) |
| POST | `/admin/tools/{id}/approve` | Approve tool |
| POST | `/admin/tools/{id}/reject` | Reject tool |
| POST | `/admin/tools/bulk-approve` | Bulk approve tools |

### Example API Calls

**Login:**
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alexandra@admin.local",
    "password": "password"
  }'
```

**Get Tools (with filters):**
```bash
curl "http://localhost:8080/api/tools?category=1&pricing=free&search=chatgpt"
```

**Submit Tool:**
```bash
curl -X POST http://localhost:8080/api/tools \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "ChatGPT",
    "description": "AI-powered conversational assistant...",
    "website": "https://chat.openai.com",
    "category_id": 1,
    "pricing_type": "freemium"
  }'
```

## 🔒 2FA & Security Guide

### How 2FA Works

1. **User Login:**
   - Enter email/password
   - Receive authentication token

2. **2FA Code Request:**
   - System automatically sends 6-digit code to email
   - Code valid for 10 minutes
   - Rate limited: max 5 codes per hour

3. **Code Verification:**
   - Enter 6-digit code from email
   - Option: "Trust this device for 30 days"
   - On success: Full access granted

4. **Trusted Devices:**
   - If device trusted: Skip 2FA for 30 days
   - Stored as secure cookie + database record
   - Can revoke anytime from settings

### Security Features

**Email-Based OTP:**
- ✅ 6-digit random code
- ✅ Expires after 10 minutes
- ✅ Rate limiting (5 codes/hour)
- ✅ Logged in audit trail

**Trusted Devices:**
- ✅ Secure token generation
- ✅ Device fingerprinting
- ✅ 30-day expiration
- ✅ Revoke individual or all devices

**Session Management:**
- ✅ Redis-backed sessions
- ✅ Laravel Sanctum tokens
- ✅ HttpOnly cookies
- ✅ CSRF protection

**Audit Logging:**
- ✅ All login attempts
- ✅ 2FA code requests
- ✅ Failed verifications
- ✅ Device trust events
- ✅ Role changes
- ✅ Tool approvals/rejections

### Finding 2FA Codes (Development)

Since we use `MAIL_MAILER=log`, codes are logged to Laravel log file:

```bash
# View recent codes
docker compose exec php_fpm tail -50 storage/logs/laravel.log

# Watch for new codes in real-time
docker compose exec php_fpm tail -f storage/logs/laravel.log | grep "2FA"
```

Look for lines like:
```
Your 2FA verification code is: 123456
```

### 2FA Workflow Example

**Scenario: First-time login**

1. Navigate to http://localhost:3000/login
2. Enter: `alexandra@admin.local` / `password`
3. System redirects to `/2fa` page
4. Check Laravel logs for code: `docker compose exec php_fpm tail -50 storage/logs/laravel.log`
5. Enter the 6-digit code
6. Check ✅ "Trust this device for 30 days" (optional)
7. Click "Verify"
8. Redirected to dashboard

**Scenario: Trusted device**

1. Login with email/password
2. System checks for trusted device cookie
3. If found and valid: Skip 2FA → Dashboard
4. If expired/revoked: Normal 2FA flow

**Scenario: Revoke all devices**

1. Login and complete 2FA
2. Go to Settings/Profile
3. Click "Revoke All Trusted Devices"
4. Next login: 2FA required again

## 🛠️ Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :8080
```

**Database connection issues:**
```bash
# Verify MySQL is running
docker compose ps mysql

# Check MySQL logs
docker compose logs mysql
```

**Frontend not loading:**
```bash
# Rebuild and restart
docker compose restart frontend

# Check logs
docker compose logs frontend -f
```

**Backend 500 errors:**
```bash
# Clear Laravel caches
docker compose exec php_fpm php artisan cache:clear
docker compose exec php_fpm php artisan config:clear
docker compose exec php_fpm php artisan route:clear

# Check logs
docker compose exec php_fpm tail -f storage/logs/laravel.log
```

**Permission issues:**
```bash
# Fix Laravel storage permissions
docker compose exec php_fpm chown -R laravel:laravel storage bootstrap/cache
```

## 📸 Application Features

### Public Pages

**Homepage** (`/`)
- Featured AI tools carousel
- Category browsing
- Search functionality
- Latest tools showcase

**Browse Tools** (`/tools`)
- Advanced filtering (category, tags, pricing)
- Search by name/description
- Sort by rating, date, popularity
- Pagination

**Tool Details** (`/tools/{id}`)
- Complete tool information
- Ratings and reviews
- Comments section
- Related tools

### Authenticated Pages

**Dashboard** (`/dashboard`)
- User statistics
- Recent activity
- Quick actions
- Notifications

**Submit Tool** (`/tools/add`)
- Comprehensive submission form
- Category and tag selection
- Logo upload
- Real-time validation

**2FA Verification** (`/2fa`)
- 6-digit code input
- Auto-submit on complete
- Resend code (60s cooldown)
- Trust device option

### Admin Panel

**Admin Dashboard** (`/admin`)
- System statistics
- Pending submissions count
- User activity overview
- Quick actions

**Tool Management** (`/admin/tools`)
- Pending submissions list
- Approve/reject tools
- Bulk operations
- Filter by status

**User Management** (`/admin/users`)
- All users list
- Role assignment
- User statistics
- Activity history

**Audit Logs** (`/admin/audit-logs`)
- Complete system activity
- Filter by action type
- User tracking
- Export capabilities

## 🚀 Production Deployment

### Prerequisites for Production

- VPS/Cloud server (Ubuntu 20.04+ recommended)
- Docker & Docker Compose installed
- Domain name configured
- SSL certificate (Let's Encrypt)

### Environment Setup

1. **Update Backend .env for Production:**

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Use real SMTP for emails
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls

# Secure session settings
SESSION_SECURE_COOKIE=true
```

2. **Update Frontend Environment:**

```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NODE_ENV=production
```

3. **Update docker-compose.yml:**

```yaml
services:
  frontend:
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://your-domain.com/api
    command: sh -c "npm install && npm run build && npm start"

  backend:
    ports:
      - "127.0.0.1:8080:80"  # Only localhost access
```

4. **Setup Nginx Reverse Proxy (on host):**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

5. **Deploy:**

```bash
# Pull latest code
git pull origin main

# Build and start services
docker compose up -d --build

# Run migrations
docker compose exec php_fpm php artisan migrate --force

# Optimize Laravel
docker compose exec php_fpm php artisan config:cache
docker compose exec php_fpm php artisan route:cache
docker compose exec php_fpm php artisan view:cache

# Seed production data (if needed)
docker compose exec php_fpm php artisan db:seed
```

### Security Checklist

- [ ] Enable HTTPS with valid SSL certificate
- [ ] Set `APP_DEBUG=false` in production
- [ ] Use strong database passwords
- [ ] Configure firewall (UFW)
- [ ] Enable `SESSION_SECURE_COOKIE=true`
- [ ] Setup automated backups
- [ ] Configure real SMTP for emails
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

### Backup Strategy

```bash
# Automated daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker compose exec mysql mysqldump -u root -p${DB_PASSWORD} ${DB_NAME} > backup_${DATE}.sql

# Backup uploads (if any)
tar -czf uploads_${DATE}.tar.gz backend/storage/app/public

# Keep only last 7 days
find . -name "backup_*.sql" -mtime +7 -delete
find . -name "uploads_*.tar.gz" -mtime +7 -delete
```

Add to crontab: `0 2 * * * /path/to/backup.sh`

## 📚 Documentation

Detailed documentation available in `/docs`:

- **[QUICKSTART.md](docs/QUICKSTART.md)** - 5-minute setup guide ⚡
- **[IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md)** - Complete feature guide
- **[AI_TOOLS_HUB.md](docs/AI_TOOLS_HUB.md)** - AI Tools Hub specifics
- **[DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** - UI/UX guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- **Backend Development** - Laravel API, Authentication, Database
- **Frontend Development** - Next.js UI, Components, UX
- **DevOps** - Docker, CI/CD, Infrastructure

## 🔗 Links

- **Repository**: https://github.com/tsvetoslav-toshev/AI-Tools-Hub-Project
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Documentation**: [/docs](./docs)

---

**Built with ❤️ using Laravel, Next.js, and Docker**
