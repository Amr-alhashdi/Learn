<?php
// config/jwt.php

return [
    'secret'          => getenv('JWT_SECRET') ?: 'CHANGE_THIS_SECRET_KEY_IN_PRODUCTION_!@#$%',
    'algorithm'       => 'HS256',
    'access_ttl'      => 3600,        // 1 hour (seconds)
    'refresh_ttl'     => 2592000,     // 30 days (seconds)
    'issuer'          => 'smart-school-api',
];
