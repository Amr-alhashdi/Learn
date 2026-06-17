<?php
// core/Database.php
// Singleton PDO wrapper for MySQL

declare(strict_types=1);

namespace Core;

use PDO;
use PDOException;
use PDOStatement;

class Database
{
    private static ?Database $instance = null;
    private PDO $pdo;

    private function __construct()
    {
        $config = require __DIR__ . '/../config/database.php';

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $config['host'],
            $config['port'],
            $config['dbname'],
            $config['charset']
        );

        try {
            $this->pdo = new PDO(
                $dsn,
                $config['username'],
                $config['password'],
                $config['options']
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'status'  => 'error',
                'message' => 'Database connection failed',
            ]);
            exit;
        }
    }

    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    // -------------------------------------------------------
    // Execute a query and return the PDOStatement
    // -------------------------------------------------------
    public function query(string $sql, array $params = []): PDOStatement
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    // -------------------------------------------------------
    // Fetch a single row
    // -------------------------------------------------------
    public function fetchOne(string $sql, array $params = []): array|false
    {
        return $this->query($sql, $params)->fetch();
    }

    // -------------------------------------------------------
    // Fetch all rows
    // -------------------------------------------------------
    public function fetchAll(string $sql, array $params = []): array
    {
        return $this->query($sql, $params)->fetchAll();
    }

    // -------------------------------------------------------
    // Insert a row and return last insert id
    // -------------------------------------------------------
    public function insert(string $table, array $data): int
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));

        $sql = "INSERT INTO `{$table}` ({$columns}) VALUES ({$placeholders})";
        $this->query($sql, array_values($data));

        return (int)$this->pdo->lastInsertId();
    }

    // -------------------------------------------------------
    // Update rows by condition
    // -------------------------------------------------------
    public function update(string $table, array $data, array $where): int
    {
        $set = implode(', ', array_map(fn($k) => "`{$k}` = ?", array_keys($data)));
        $cond = implode(' AND ', array_map(fn($k) => "`{$k}` = ?", array_keys($where)));

        $sql = "UPDATE `{$table}` SET {$set} WHERE {$cond}";
        $params = array_merge(array_values($data), array_values($where));

        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    // -------------------------------------------------------
    // Delete rows
    // -------------------------------------------------------
    public function delete(string $table, array $where): int
    {
        $cond = implode(' AND ', array_map(fn($k) => "`{$k}` = ?", array_keys($where)));
        $sql = "DELETE FROM `{$table}` WHERE {$cond}";
        return $this->query($sql, array_values($where))->rowCount();
    }

    // -------------------------------------------------------
    // Count rows
    // -------------------------------------------------------
    public function count(string $sql, array $params = []): int
    {
        return (int)$this->query($sql, $params)->fetchColumn();
    }

    // -------------------------------------------------------
    // Pagination helper
    // -------------------------------------------------------
    public function paginate(
        string $sql,
        array $params,
        int $page,
        int $perPage
    ): array {
        $countSql = "SELECT COUNT(*) FROM ({$sql}) AS count_query";
        $total = $this->count($countSql, $params);

        $offset = ($page - 1) * $perPage;
        $paginatedSql = "{$sql} LIMIT {$perPage} OFFSET {$offset}";
        $data = $this->fetchAll($paginatedSql, $params);

        return [
            'data'       => $data,
            'pagination' => [
                'total'       => $total,
                'per_page'    => $perPage,
                'current_page'=> $page,
                'last_page'   => (int)ceil($total / $perPage),
            ],
        ];
    }

    // -------------------------------------------------------
    // Transactions
    // -------------------------------------------------------
    public function beginTransaction(): void { $this->pdo->beginTransaction(); }
    public function commit(): void           { $this->pdo->commit(); }
    public function rollback(): void         { $this->pdo->rollBack(); }

    public function transaction(callable $callback): mixed
    {
        $this->beginTransaction();
        try {
            $result = $callback($this);
            $this->commit();
            return $result;
        } catch (\Throwable $e) {
            $this->rollback();
            throw $e;
        }
    }

    // Prevent cloning
    private function __clone() {}
}
