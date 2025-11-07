# 🚀 Quick Start Guide - AI Tools Hub

Get up and running in **5 minutes**!

## Prerequisites

✅ Docker Desktop installed and running  
✅ Git installed  
✅ 8GB RAM available  

## Step-by-Step Setup

### 1. Clone & Navigate

```bash
git clone https://github.com/tsvetoslav-toshev/AI-Tools-Hub-Project.git
cd AI-Tools-Hub-Project
```

### 2. Start Everything

```bash
docker compose up -d
```

Wait ~30 seconds for all services to start.

### 3. Setup Database

```bash
docker compose exec php_fpm php artisan migrate --seed
```

This creates:
- Database tables
- 4 default users
- Sample categories and tags

### 4. Access the Application

Open your browser:

🌐 **Frontend**: http://localhost:3000  
🔌 **Backend API**: http://localhost:8080/api/status

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | alexandra@admin.local | password |
| Moderator | ivan@moderator.local | password |
| User | elena@frontend.local | password |
| User | petar@backend.local | password |

## First Login Flow

1. Go to: http://localhost:3000/login
2. Enter: `alexandra@admin.local` / `password`
3. System redirects to 2FA page
4. **Get your code:**
   ```bash
   docker compose exec php_fpm tail -50 storage/logs/laravel.log | grep "2FA"
   ```
5. Enter the 6-digit code
6. ✅ Check "Trust this device" (optional)
7. Welcome to the dashboard! 🎉

## What's Next?

### Try These Actions:

**As User:**
- Browse tools at http://localhost:3000/tools
- Submit a new tool at http://localhost:3000/tools/add
- Rate and comment on tools

**As Admin:**
- Visit admin panel: http://localhost:3000/admin
- Review pending tools
- Manage users and roles
- View audit logs

## Common Commands

```bash
# Stop all services
docker compose down

# Restart services
docker compose restart

# View logs
docker compose logs -f

# Access database
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass

# Clear Laravel cache
docker compose exec php_fpm php artisan cache:clear
```

## Troubleshooting

**Ports already in use?**
```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :8080
```

**Frontend not loading?**
```bash
docker compose logs frontend -f
docker compose restart frontend
```

**Can't find 2FA code?**
```bash
# Watch logs in real-time
docker compose exec php_fpm tail -f storage/logs/laravel.log
```

**Database connection failed?**
```bash
# Wait for MySQL to fully start (takes ~15 seconds)
docker compose ps mysql
docker compose logs mysql
```

## Need More Help?

📖 Full documentation: [README.md](../README.md)  
🔧 Implementation guide: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)  
🎨 Design system: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

**You're all set! Happy coding! 🚀**
