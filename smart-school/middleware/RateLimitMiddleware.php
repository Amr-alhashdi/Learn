<?php
// middleware/RateLimitMiddleware.php
// Simple IP-based rate limiting using file-based counters

declare(strict_types=1);

namespace Middleware;

use Core\Request;
use Core\Response;

class RateLimitMiddleware
{
    public function handle(Request $request): void
    {
        $config = require __DIR__ . '/../config/app.php';
        if (!($config['rate_limit']['enabled'] ?? true)) return;

        $maxRequests = $config['rate_limit']['max_requests'];
        $window      = $config['rate_limit']['window'];
        $ip          = $request->ip();
        $key         = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $ip);
        $file        = __DIR__ . '/../storage/logs/rl_' . $key . '.json';

        $now  = time();
        $data = ['count' => 0, 'reset_at' => $now + $window];

        if (file_exists($file)) {
            $stored = json_decode(file_get_contents($file), true);
            if ($stored && $stored['reset_at'] > $now) {
                $data = $stored;
            }
        }

        $data['count']++;
        file_put_contents($file, json_encode($data), LOCK_EX);

        // Set rate limit headers
        header("X-RateLimit-Limit: {$maxRequests}");
        header("X-RateLimit-Remaining: " . max(0, $maxRequests - $data['count']));
        header("X-RateLimit-Reset: {$data['reset_at']}");

        if ($data['count'] > $maxRequests) {
            Response::tooManyRequests('تجاوزت الحد المسموح من الطلبات. انتظر دقيقة.');
        }
    }
}
