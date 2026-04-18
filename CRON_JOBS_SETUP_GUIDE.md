# 🚀 Complete Cron Jobs Setup Guide for SMM Website

This guide will help you set up all cron jobs for your MesavsSMM website on cPanel, Plesk, or any other hosting.

---

## 📋 Table of Contents

1. [What Cron Jobs Do](#what-cron-jobs-do)
2. [Prerequisites](#prerequisites)
3. [cPanel Setup](#cpanel-setup)
4. [Plesk Setup](#plesk-setup)
5. [Command Line Setup (SSH)](#command-line-setup-ssh)
6. [Testing Cron Jobs](#testing-cron-jobs)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## 🎯 What Cron Jobs Do

Your SMM website has **7 automated cron jobs** that run at different intervals:

| Cron Job | Frequency | Purpose |
|----------|-----------|---------|
| `orders:check-status` | Every 5 minutes | Check order status from provider |
| `orders:check-refill-status` | Every 30 minutes | Check pending refill statuses |
| `orders:check-refills` | Every 6 hours | Check if orders need refills |
| `provider:sync-orders` | Every 10 minutes | Sync orders with provider API |
| `orders:process-refunds` | Every hour | Process refunds for failed orders |
| `notifications:send` | Every 2 minutes | Send pending notifications |
| `database:cleanup` | Daily at 2 AM | Clean up old database records |

---

## ✅ Prerequisites

Before setting up cron jobs, ensure:

1. ✅ Laravel application is installed and working
2. ✅ Database connection is configured
3. ✅ API provider is configured in admin panel
4. ✅ You have access to cPanel/Plesk or SSH

---

## 🖥️ cPanel Setup

### Method 1: Single Cron Job (Recommended)

cPanel uses **ONE main cron job** that triggers Laravel's scheduler, which then runs all your scheduled tasks.

#### Step 1: Find Your PHP Path

1. Log in to **cPanel**
2. Go to **Select PHP Version** or **MultiPHP Manager**
3. Note your PHP version (e.g., `php8.2` or `/usr/bin/php82`)
4. Or check via SSH: `which php` or `which php82`

#### Step 2: Find Your Project Path

Your project path will be something like:
```
/home/username/public_html/backend
```
or
```
/home/username/domains/yourdomain.com/public_html/backend
```

#### Step 3: Add Cron Job in cPanel

1. In cPanel, go to **Advanced** → **Cron Jobs**
2. Under **Add New Cron Job**, choose **Standard**
3. Use this configuration:

**Settings:**
- **Minute**: `*`
- **Hour**: `*`
- **Day**: `*`
- **Month**: `*`
- **Weekday**: `*`

**Command:**
```bash
cd /home/username/path/to/backend && /usr/bin/php82 artisan schedule:run >> /dev/null 2>&1
```

**Replace:**
- `/home/username/path/to/backend` with your actual backend folder path
- `/usr/bin/php82` with your PHP path (could be `php`, `php8.1`, `php8.2`, etc.)

**Example:**
```bash
cd /home/boostelix/public_html/backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

4. Click **Add New Cron Job**

### Method 2: Individual Cron Jobs (Alternative)

If Method 1 doesn't work, you can add each command separately:

```bash
# Check order status (every 5 minutes)
*/5 * * * * cd /home/username/path/to/backend && /usr/bin/php artisan orders:check-status >> /dev/null 2>&1

# Check refill status (every 30 minutes)
*/30 * * * * cd /home/username/path/to/backend && /usr/bin/php artisan orders:check-refill-status >> /dev/null 2>&1

# Check refill eligibility (every 6 hours)
0 */6 * * * cd /home/username/path/to/backend && /usr/bin/php artisan orders:check-refills >> /dev/null 2>&1

# Sync provider orders (every 10 minutes)
*/10 * * * * cd /home/username/path/to/backend && /usr/bin/php artisan provider:sync-orders >> /dev/null 2>&1

# Process refunds (every hour)
0 * * * * cd /home/username/path/to/backend && /usr/bin/php artisan orders:process-refunds >> /dev/null 2>&1

# Send notifications (every 2 minutes)
*/2 * * * * cd /home/username/path/to/backend && /usr/bin/php artisan notifications:send >> /dev/null 2>&1

# Database cleanup (daily at 2 AM)
0 2 * * * cd /home/username/path/to/backend && /usr/bin/php artisan database:cleanup >> /dev/null 2>&1
```

---

## 🖥️ Plesk Setup

### Step 1: Access Scheduled Tasks

1. Log in to **Plesk**
2. Go to **Tools & Settings** → **Scheduled Tasks**
3. Click **Add Task**

### Step 2: Configure Task

**General Settings:**
- **Task name**: `Laravel Scheduler`
- **Run**: `Periodically`

**Schedule:**
- **Interval**: `Every minute`
- **Start time**: Choose a time

**Command:**
```
cd /var/www/vhosts/yourdomain.com/httpdocs/backend && /usr/bin/php artisan schedule:run
```

**Run as:** Your domain user (usually shown in Plesk)

4. Click **OK**

---

## 💻 Command Line Setup (SSH)

If you have SSH access, you can set up cron jobs directly:

### Step 1: Open Crontab

```bash
crontab -e
```

### Step 2: Add Laravel Scheduler

Add this line (adjust paths as needed):

```bash
* * * * * cd /var/www/html/backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

### Step 3: Save and Exit

- Press `Esc`, then type `:wq` and press Enter (vi/vim)
- Or `Ctrl+X`, then `Y`, then Enter (nano)

### Step 4: Verify

```bash
crontab -l
```

You should see your cron job listed.

---

## 🧪 Testing Cron Jobs

### Test Individual Commands

SSH into your server and run:

```bash
cd /path/to/backend

# Test order status check
php artisan orders:check-status

# Test refill check
php artisan orders:check-refills --dry-run

# Test refunds (dry run - won't make changes)
php artisan orders:process-refunds --dry-run

# Test database cleanup
php artisan database:cleanup

# Test notifications
php artisan notifications:send

# Test provider sync
php artisan provider:sync-orders

# Test refill status check
php artisan orders:check-refill-status
```

### Test Scheduler

```bash
php artisan schedule:list
```

This shows all scheduled tasks and when they run next.

### Run Scheduler Manually

```bash
php artisan schedule:run
```

This runs all due scheduled tasks immediately.

---

## 📊 Monitoring & Troubleshooting

### Check Cron Job Logs

All cron jobs write logs to:
```
storage/logs/cron-*.log
```

**Log Files:**
- `storage/logs/cron-orders.log` - Order status checks
- `storage/logs/cron-refills.log` - Refill status checks
- `storage/logs/cron-refill-check.log` - Refill eligibility checks
- `storage/logs/cron-sync.log` - Provider sync
- `storage/logs/cron-refunds.log` - Refund processing
- `storage/logs/cron-notifications.log` - Notifications
- `storage/logs/cron-cleanup.log` - Database cleanup

### View Logs

**Via SSH:**
```bash
tail -f storage/logs/cron-orders.log
```

**Via cPanel File Manager:**
1. Navigate to `storage/logs/`
2. Open any `cron-*.log` file

### Common Issues

#### Issue 1: Cron Job Not Running

**Solution:**
- Check PHP path is correct
- Verify project path is correct
- Ensure file permissions are correct:
  ```bash
  chmod -R 755 storage
  chmod -R 755 bootstrap/cache
  ```

#### Issue 2: Permission Denied

**Solution:**
```bash
chmod +x artisan
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

#### Issue 3: Cron Job Running But Nothing Happens

**Solution:**
1. Check Laravel logs: `storage/logs/laravel.log`
2. Test command manually: `php artisan orders:check-status`
3. Check database connection
4. Verify API provider is configured

#### Issue 4: "Artisan command not found"

**Solution:**
- Use full path to artisan:
  ```bash
  /full/path/to/backend/artisan schedule:run
  ```
- Or ensure you're in the correct directory with `cd`

### Enable Detailed Logging

To get more detailed output, remove `>> /dev/null 2>&1` from cron command:

```bash
cd /path/to/backend && /usr/bin/php artisan schedule:run >> storage/logs/cron-scheduler.log 2>&1
```

---

## 📝 Quick Reference

### cPanel Cron Command Template

```bash
cd /home/USERNAME/public_html/backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

### Find Your PHP Path

**Via cPanel:**
- Advanced → Select PHP Version

**Via SSH:**
```bash
which php
which php82
which php8.2
```

**Via Terminal in cPanel:**
```bash
php -v
```

### Find Your Project Path

**In cPanel File Manager:**
- Navigate to your `backend` folder
- Right-click → Copy Path

**Via SSH:**
```bash
pwd
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Cron job is added in cPanel/Plesk
- [ ] PHP path is correct
- [ ] Project path is correct
- [ ] `php artisan schedule:list` shows all tasks
- [ ] `php artisan schedule:run` executes without errors
- [ ] Log files are being created in `storage/logs/`
- [ ] Orders are updating automatically
- [ ] Refunds are processing
- [ ] Notifications are being sent

---

## 🆘 Support

If you encounter issues:

1. **Check logs**: `storage/logs/laravel.log` and `storage/logs/cron-*.log`
2. **Test manually**: Run commands via SSH
3. **Verify paths**: Ensure all paths are correct
4. **Check permissions**: Ensure Laravel can write to storage

---

## 📚 Additional Resources

- [Laravel Task Scheduling Documentation](https://laravel.com/docs/scheduling)
- [cPanel Cron Jobs Guide](https://docs.cpanel.net/knowledge-base/general-systems-administration/how-to-set-up-a-cron-job/)
- [Plesk Scheduled Tasks](https://docs.plesk.com/en-US/obsidian/administrator-guide/server-administration/scheduled-tasks.73390/)

---

**Last Updated**: January 2025

