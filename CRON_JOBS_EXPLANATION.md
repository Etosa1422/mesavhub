# Cron Jobs in SMM Websites - Complete Guide

## 🤔 Why Do SMM Websites Need Cron Jobs?

An SMM (Social Media Marketing) website is a **marketplace** that connects users who want to buy followers/likes/views with providers who actually deliver them. Cron jobs are **essential** because the website needs to:

1. **Check Order Status Automatically**
   - When a user places an order for 1000 Instagram followers, the order goes to an external provider
   - The provider takes time to deliver (minutes to hours)
   - You can't manually check every order - cron jobs check automatically
   - Updates order status: `processing` → `in-progress` → `completed` or `partial` or `failed`

2. **Sync with External Providers**
   - Most SMM sites don't own the accounts that deliver followers
   - They connect to external API providers (like CheapPanel, SidesMedia, etc.)
   - These providers send updates via webhooks OR you poll their API
   - Cron jobs periodically fetch updates from these providers

3. **Update Order Counters**
   - Track `start_counter` (initial followers), `remains` (still pending)
   - Example: Order 1000 followers, 800 delivered, 200 remaining
   - Cron job updates these numbers automatically

4. **Handle Refunds & Failures**
   - If order fails, automatically refund user's balance
   - Notify user about failed orders
   - Update order status to `failed` or `refunded`

5. **Process Notifications**
   - Send email/push notifications when orders complete
   - Alert users about order updates
   - Process queued notifications

6. **Database Maintenance**
   - Clean old logs
   - Archive completed orders
   - Optimize database

---

## 🔄 What is a REFILL?

A **refill** is when followers/likes that were already delivered **drop** (get removed), and you add new ones to replace them.

### Example Scenario:

1. **Day 1**: User orders 1000 Instagram followers
   - Provider delivers 1000 followers ✅
   - Order status: `completed`

2. **Day 15**: Instagram removes fake accounts
   - User now has only 700 followers (300 dropped) ❌
   - Order status: `completed` but followers decreased

3. **Refill Request**: User or system requests refill
   - System checks current follower count
   - Requests provider to add 300 more followers
   - Refill status: `pending` → `processing` → `completed`

### Types of Refills:

1. **Manual Refill**:
   - User requests refill via dashboard
   - Admin manually approves
   - Provider adds replacement followers

2. **Automatic Refill** (requires cron job):
   - System automatically checks if followers dropped
   - If drop detected, automatically requests refill
   - No user action needed

3. **Guaranteed Refill**:
   - Service has "30-day guarantee"
   - If followers drop within 30 days, refill is automatic
   - Usually requires cron job to monitor

---

## ✅ Does Refill Need Cron Jobs?

**YES!** Cron jobs are **critical** for refills, especially automatic ones.

### What Cron Jobs Do for Refills:

1. **Monitor Order Drop Rate** (Every 6-12 hours)
   ```
   - Check orders that are "completed" but within guarantee period
   - Compare original quantity vs current count
   - If drop detected (e.g., ordered 1000, now only 850), flag for refill
   ```

2. **Auto-Request Refills** (Every 1-2 hours)
   ```
   - Find orders flagged for refill
   - Request refill from provider API
   - Update refill_status to "pending"
   ```

3. **Check Refill Status** (Every 30 minutes)
   ```
   - Check pending refills with provider
   - Update refill_status: pending → processing → completed
   - Notify user when refill completes
   ```

4. **Update Refill History**
   ```
   - Log all refill attempts
   - Track refill_at timestamps
   - Store refill success/failure records
   ```

---

## 📋 Example Cron Job Tasks for SMM Website

### Recommended Cron Schedule:

```bash
# Check order status every 5 minutes
*/5 * * * * php artisan orders:check-status

# Check refill eligibility every 6 hours  
0 */6 * * * php artisan orders:check-refills

# Sync with provider API every 10 minutes
*/10 * * * * php artisan provider:sync-orders

# Process notifications every 2 minutes
*/2 * * * * php artisan notifications:send

# Clean old data daily at 2 AM
0 2 * * * php artisan database:cleanup

# Update user balances (refunds) every hour
0 * * * * php artisan orders:process-refunds
```

---

## 🔧 Implementation Example (Laravel)

### 1. Create Artisan Commands:

```bash
php artisan make:command CheckOrderStatus
php artisan make:command CheckRefillEligibility
php artisan make:command SyncProviderOrders
```

### 2. Example: Check Order Status Command

```php
// app/Console/Commands/CheckOrderStatus.php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\ApiProvider;

class CheckOrderStatus extends Command
{
    protected $signature = 'orders:check-status';
    protected $description = 'Check and update order status from provider API';

    public function handle()
    {
        // Get all pending/in-progress orders
        $orders = Order::whereIn('status', ['processing', 'in-progress', 'partial'])
            ->whereNotNull('api_order_id')
            ->get();

        foreach ($orders as $order) {
            // Call provider API to check status
            $status = $this->checkProviderStatus($order);
            
            // Update order
            $order->status = $status['status'];
            $order->remains = $status['remains'] ?? $order->remains;
            $order->start_counter = $status['start_count'] ?? $order->start_counter;
            $order->save();
        }

        $this->info("Checked {$orders->count()} orders");
    }
}
```

### 3. Example: Refill Check Command

```php
// app/Console/Commands/CheckRefillEligibility.php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use Carbon\Carbon;

class CheckRefillEligibility extends Command
{
    protected $signature = 'orders:check-refills';
    protected $description = 'Check if orders need refills';

    public function handle()
    {
        // Get completed orders within guarantee period
        $orders = Order::where('status', 'completed')
            ->where('refill_status', '!=', 'pending')
            ->where('refill_status', '!=', 'processing')
            ->whereHas('service', function($q) {
                $q->where('refill', true)
                  ->where('guarantee_days', '>', 0);
            })
            ->where('created_at', '>=', Carbon::now()->subDays(30)) // Within guarantee
            ->get();

        foreach ($orders as $order) {
            // Check current count (you'd call Instagram API here)
            $currentCount = $this->getCurrentCount($order);
            
            // If dropped more than 10%, request refill
            $dropPercentage = (($order->quantity - $currentCount) / $order->quantity) * 100;
            
            if ($dropPercentage > 10) {
                $this->requestRefill($order, $currentCount);
            }
        }
    }
}
```

### 4. Register in Kernel.php

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    // Check order status every 5 minutes
    $schedule->command('orders:check-status')
        ->everyFiveMinutes()
        ->withoutOverlapping();

    // Check refills every 6 hours
    $schedule->command('orders:check-refills')
        ->everySixHours()
        ->withoutOverlapping();

    // Sync with provider every 10 minutes
    $schedule->command('provider:sync-orders')
        ->everyTenMinutes()
        ->withoutOverlapping();
}
```

---

## 🎯 Summary

### Why Cron Jobs?
- ✅ Automatically update order status
- ✅ Sync with external providers
- ✅ Process refunds
- ✅ Send notifications
- ✅ Maintain database

### Why Refills Need Cron Jobs?
- ✅ Automatically detect follower drops
- ✅ Request refills without user action
- ✅ Monitor refill progress
- ✅ Update refill status
- ✅ Honor guarantee periods

### Without Cron Jobs:
- ❌ Orders never update (stuck in "processing")
- ❌ Users never know if orders completed
- ❌ Refills must be done manually
- ❌ Providers never sync
- ❌ Bad user experience

---

## 🚀 Next Steps

1. **Set up Laravel Scheduler**: Add to server crontab
   ```bash
   * * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
   ```

2. **Create Commands**: Build the artisan commands above

3. **Test**: Run commands manually first
   ```bash
   php artisan orders:check-status
   ```

4. **Monitor**: Log cron job runs and check for errors

5. **Optimize**: Adjust frequency based on your needs

