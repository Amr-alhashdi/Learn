<?php
// middleware/AuthMiddleware.php
// Validates JWT token on every protected request

declare(strict_types=1);

namespace Middleware;

use Core\Auth;
use Core\Request;

class AuthMiddleware
{
    public function handle(Request $request): void
    {
        // Auth::user() will call Response::unauthorized() and exit if invalid
        Auth::user($request);
    }
}
