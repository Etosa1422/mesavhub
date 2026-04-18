# 📦 Cron Jobs Summary

## ✅ Created Files

All cron job commands have been created in:
```
Boostelixbackend/app/Console/Commands/
```

### Commands Created:

1. **CheckOrderStatus.php** - Checks order status from provider API
2. **CheckRefillEligibility.php** - Checks if orders need refills
3. **CheckRefillStatus.php** - Checks status of pending refills
4. **SyncProviderOrders.php** - Syncs orders with provider in batch
5. **ProcessRefunds.php** - Processes refunds for failed orders
6. **SendPendingNotifications.php** - Sends pending notifications
7. **DatabaseCleanup.php** - Cleans up old database records

## 📅 Schedule Configuration

All schedules are configured in:
```
Boostelixbackend/routes/console.php
```

### Schedule:

| Command | Frequency | Log File |
|---------|-----------|----------|
| `orders:check-status` | Every 5 minutes | `cron-orders.log` |
| `orders:check-refill-status` | Every 30 minutes | `cron-refills.log` |
| `orders:check-refills` | Every 6 hours | `cron-refill-check.log` |
| `provider:sync-orders` | Every 10 minutes | `cron-sync.log` |
| `orders:process-refunds` | Every hour | `cron-refunds.log` |
| `notifications:send` | Every 2 minutes | `cron-notifications.log` |
| `database:cleanup` | Daily at 2 AM | `cron-cleanup.log` |
| `tickets:auto-close` | Daily at 3 AM | `cron-tickets-close.log` |

## 🚀 Setup Instructions

### For cPanel:

1. Go to **Advanced → Cron Jobs**
2. Add this command:
   ```bash
   cd /home/username/path/to/backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
   ```
3. Set frequency: `* * * * *` (every minute)

### For SSH/Command Line:

Add to crontab:
```bash
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

## 🧪 Testing

Run the test script:
```bash
cd Boostelixbackend
bash test-cron-jobs.sh
```

Or test individual commands:
```bash
php artisan orders:check-status
php artisan schedule:list
```

## 📝 Documentation

- **Full Guide**: See `CRON_JOBS_SETUP_GUIDE.md`
- **Quick Setup**: See `CRON_JOBS_QUICK_SETUP.txt`

## ✅ What Each Cron Job Does

### 1. Check Order Status
- Checks orders with status: `processing`, `in-progress`, `partial`
- Updates status from provider API
- Creates notifications when orders complete
- Runs every 5 minutes

### 2. Check Refill Eligibility
- Checks completed orders with refill enabled
- Detects if followers/likes have dropped
- Automatically requests refills if drop > 10% or > 50 units
- Runs every 6 hours

### 3. Check Refill Status
- Monitors pending refills
- Updates refill status from provider
- Creates notifications when refills complete
- Runs every 30 minutes

### 4. Sync Provider Orders
- Syncs multiple orders in batch with provider
- More efficient than individual checks
- Runs every 10 minutes

### 5. Process Refunds
- Finds failed/cancelled orders
- Refunds money to user balance
- Creates transaction records
- Creates notifications
- Runs every hour

### 6. Send Notifications
- Processes pending notifications
- Can send emails (if configured)
- Runs every 2 minutes

### 7. Database Cleanup
- Removes old read notifications
- Optimizes database tables
- Updates table statistics
- Runs daily at 2 AM

## 📊 Logs

All cron jobs write logs to:
```
storage/logs/cron-*.log
```

Monitor logs:
```bash
tail -f storage/logs/cron-orders.log
```

## 🔧 Troubleshooting

1. **Cron not running?**
   - Check PHP path
   - Verify project path
   - Check file permissions

2. **Commands fail?**
   - Run manually: `php artisan orders:check-status`
   - Check Laravel logs: `storage/logs/laravel.log`
   - Verify API provider is configured

3. **No logs?**
   - Check directory permissions: `chmod -R 775 storage`
   - Verify log directory exists

## 🎯 Next Steps

1. ✅ Set up cron job in cPanel/SSH
2. ✅ Test commands manually
3. ✅ Monitor logs for first 24 hours
4. ✅ Adjust schedules if needed

---

**Status**: ✅ All cron jobs created and ready to use!

