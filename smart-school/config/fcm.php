<?php
// config/fcm.php

return [
    'server_key'   => getenv('FCM_SERVER_KEY') ?: '',
    'api_url'      => 'https://fcm.googleapis.com/fcm/send',
    'enabled'      => (bool)(getenv('FCM_ENABLED') ?: false),
];
