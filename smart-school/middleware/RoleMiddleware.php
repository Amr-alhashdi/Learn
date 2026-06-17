<?php
// middleware/RoleMiddleware.php
// Validates if the authenticated user has the required role

declare(strict_types=1);

namespace Middleware;

use Core\Auth;
use Core\Request;
use Core\Response;

class RoleMiddleware
{
    private array $allowedRoles;

    public function __construct(string ...$roles)
    {
        $this->allowedRoles = $roles;
    }

    public function handle(Request $request): void
    {
        $user = Auth::user($request);
        
        if (empty($this->allowedRoles)) {
            return; // No specific role required
        }

        if (!in_array($user['role'], $this->allowedRoles, true)) {
            Response::forbidden('Access denied: Insufficient permissions for your role.');
        }
    }
}
