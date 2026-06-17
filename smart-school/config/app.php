<?php
// config/app.php

return [
    'name'          => 'Smart School API',
    'version'       => '1.0.0',
    'env'           => getenv('APP_ENV') ?: 'development',
    'debug'         => getenv('APP_DEBUG') ?: true,
    'url'           => getenv('APP_URL') ?: 'http://localhost',
    'timezone'      => 'Asia/Aden',

    // CORS
    'cors' => [
        'allowed_origins'  => ['*'],   // In production: specify domains
        'allowed_methods'  => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'allowed_headers'  => ['Content-Type', 'Authorization', 'X-Requested-With'],
        'max_age'          => 86400,
    ],

    // Rate Limiting
    'rate_limit' => [
        'enabled'   => true,
        'max_requests' => 100,        // per window
        'window'       => 60,         // seconds
    ],

    // File Upload
    'upload' => [
        'max_size_mb'      => 100,
        'allowed_types'    => [
            'pdf'  => 'application/pdf',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'ppt'  => 'application/vnd.ms-powerpoint',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'mp4'  => 'video/mp4',
        ],
        'storage_path'     => __DIR__ . '/../storage/uploads',
        'base_url'         => '/storage/uploads',
    ],

    // Pagination
    'pagination' => [
        'default_per_page' => 20,
        'max_per_page'     => 100,
    ],
];
