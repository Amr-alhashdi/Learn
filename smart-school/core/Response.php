<?php
// core/Response.php
// JSON Response helper

declare(strict_types=1);

namespace Core;

class Response
{
    // -------------------------------------------------------
    // Standard success response
    // -------------------------------------------------------
    public static function success(
        mixed $data = null,
        string $message = 'success',
        int $code = 200
    ): never {
        http_response_code($code);
        echo json_encode([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // -------------------------------------------------------
    // Paginated success response
    // -------------------------------------------------------
    public static function paginated(
        array $result,
        string $message = 'success'
    ): never {
        http_response_code(200);
        echo json_encode([
            'status'     => 'success',
            'message'    => $message,
            'data'       => $result['data'],
            'pagination' => $result['pagination'],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // -------------------------------------------------------
    // Error response
    // -------------------------------------------------------
    public static function error(
        string $message,
        int $code = 400,
        mixed $errors = null
    ): never {
        http_response_code($code);
        $body = [
            'status'  => 'error',
            'message' => $message,
        ];
        if ($errors !== null) {
            $body['errors'] = $errors;
        }
        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // -------------------------------------------------------
    // Shortcut responses
    // -------------------------------------------------------
    public static function created(mixed $data = null, string $message = 'Created successfully'): never
    {
        self::success($data, $message, 201);
    }

    public static function unauthorized(string $message = 'Unauthorized'): never
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Forbidden'): never
    {
        self::error($message, 403);
    }

    public static function notFound(string $message = 'Resource not found'): never
    {
        self::error($message, 404);
    }

    public static function validationError(array $errors, string $message = 'Validation failed'): never
    {
        self::error($message, 422, $errors);
    }

    public static function serverError(string $message = 'Internal server error'): never
    {
        self::error($message, 500);
    }

    public static function tooManyRequests(string $message = 'Too many requests'): never
    {
        self::error($message, 429);
    }
}
