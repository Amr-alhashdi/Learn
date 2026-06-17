<?php
// core/FileUpload.php
// Secure file upload manager

declare(strict_types=1);

namespace Core;

class FileUpload
{
    private array $config;

    public function __construct()
    {
        $appConfig    = require __DIR__ . '/../config/app.php';
        $this->config = $appConfig['upload'];
    }

    // -------------------------------------------------------
    // Handle a single file upload
    // $fileInput = $_FILES['file']
    // $subDir    = 'curricula' | 'summaries' | 'presentations' | 'avatars' ...
    // Returns relative URL path on success
    // -------------------------------------------------------
    public function upload(array $fileInput, string $subDir): string
    {
        $this->validateUpload($fileInput);

        // Detect real MIME type
        $finfo    = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($fileInput['tmp_name']);

        // Check against whitelist
        if (!in_array($mimeType, $this->config['allowed_types'], true)) {
            Response::error("نوع الملف غير مسموح به: {$mimeType}", 422);
        }

        // Check size
        $maxBytes = $this->config['max_size_mb'] * 1024 * 1024;
        if ($fileInput['size'] > $maxBytes) {
            Response::error("حجم الملف يتجاوز الحد المسموح ({$this->config['max_size_mb']} MB)", 422);
        }

        // Build safe destination path
        $ext         = $this->extensionFromMime($mimeType);
        $randomName  = bin2hex(random_bytes(16)) . '.' . $ext;
        $destDir     = rtrim($this->config['storage_path'], '/') . '/' . $subDir;

        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        $destPath = $destDir . '/' . $randomName;

        if (!move_uploaded_file($fileInput['tmp_name'], $destPath)) {
            Response::serverError('فشل رفع الملف');
        }

        // Return relative URL
        return $this->config['base_url'] . '/' . $subDir . '/' . $randomName;
    }

    // -------------------------------------------------------
    // Delete a file by its relative URL
    // -------------------------------------------------------
    public function delete(string $relativeUrl): bool
    {
        $base = $this->config['base_url'];
        if (!str_starts_with($relativeUrl, $base)) return false;

        $relativePath = substr($relativeUrl, strlen($base));
        $fullPath     = rtrim($this->config['storage_path'], '/') . $relativePath;

        if (file_exists($fullPath) && is_file($fullPath)) {
            return unlink($fullPath);
        }
        return false;
    }

    // -------------------------------------------------------
    // Validate $_FILES entry
    // -------------------------------------------------------
    private function validateUpload(array $file): void
    {
        if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            $errors = [
                UPLOAD_ERR_INI_SIZE   => 'الملف يتجاوز حجم php.ini',
                UPLOAD_ERR_FORM_SIZE  => 'الملف يتجاوز حجم النموذج',
                UPLOAD_ERR_PARTIAL    => 'تم رفع جزء من الملف فقط',
                UPLOAD_ERR_NO_FILE    => 'لم يتم اختيار ملف',
                UPLOAD_ERR_NO_TMP_DIR => 'مجلد مؤقت مفقود',
                UPLOAD_ERR_CANT_WRITE => 'فشل كتابة الملف على القرص',
                UPLOAD_ERR_EXTENSION  => 'امتداد PHP أوقف الرفع',
            ];
            $msg = $errors[$file['error'] ?? UPLOAD_ERR_NO_FILE] ?? 'خطأ غير معروف في الرفع';
            Response::error($msg, 422);
        }

        // Ensure it was actually uploaded (security)
        if (!is_uploaded_file($file['tmp_name'])) {
            Response::error('محاولة رفع ملف غير مشروعة', 400);
        }
    }

    // -------------------------------------------------------
    // Get extension from MIME type
    // -------------------------------------------------------
    private function extensionFromMime(string $mime): string
    {
        return match ($mime) {
            'application/pdf'   => 'pdf',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
            'application/vnd.ms-powerpoint' => 'ppt',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'   => 'docx',
            'image/jpeg'        => 'jpg',
            'image/png'         => 'png',
            'video/mp4'         => 'mp4',
            default             => 'bin',
        };
    }

    // -------------------------------------------------------
    // Format file size for display
    // -------------------------------------------------------
    public static function formatSize(int $bytes): string
    {
        if ($bytes >= 1048576) return round($bytes / 1048576, 2) . ' MB';
        if ($bytes >= 1024)    return round($bytes / 1024, 2) . ' KB';
        return $bytes . ' B';
    }
}
