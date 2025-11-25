<?php
/**
 * Simple authentication endpoint for InfinityFree MySQL hosting.
 *
 * Exposes two actions:
 *  - signup: creates a user with email + hashed password
 *  - signin: verifies credentials and returns a welcome message
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Méthode non autorisée (POST requis).']);
    exit;
}

// Database credentials (use environment variables in InfinityFree panel when possible)
$host = getenv('DB_HOST') ?: 'sql###.epizy.com';
$dbName = getenv('DB_NAME') ?: 'epiz_00000000_magic';
$user = getenv('DB_USER') ?: 'epiz_00000000';
$password = getenv('DB_PASS') ?: 'motdepasse';
$port = getenv('DB_PORT') ?: '3306';

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = $input['action'] ?? 'signup';
$email = trim($input['email'] ?? '');
$plainPassword = $input['password'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Adresse e-mail invalide.']);
    exit;
}

if (strlen($plainPassword) < 6) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Le mot de passe doit contenir au moins 6 caractères.']);
    exit;
}

try {
    $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Ensure the users table exists (Idempotent for first deploys)
    $pdo->exec('CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(190) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

    if ($action === 'signup') {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);

        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['ok' => false, 'message' => 'Un compte existe déjà avec cet e-mail.']);
            exit;
        }

        $hashedPassword = password_hash($plainPassword, PASSWORD_BCRYPT);
        $insert = $pdo->prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
        $insert->execute([$email, $hashedPassword]);

        echo json_encode(['ok' => true, 'message' => 'Compte créé avec succès.']);
        exit;
    }

    if ($action === 'signin') {
        $stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $userRow = $stmt->fetch();

        if (!$userRow || !password_verify($plainPassword, $userRow['password_hash'])) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'message' => 'Identifiants incorrects.']);
            exit;
        }

        echo json_encode(['ok' => true, 'message' => 'Connexion réussie. Bon retour parmi les Arpenteurs !']);
        exit;
    }

    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Action inconnue. Utilisez signup ou signin.']);
} catch (PDOException $e) {
    http_response_code(500);
    $isProd = getenv('APP_ENV') === 'production';
    $error = $isProd ? 'Erreur serveur, réessayez plus tard.' : $e->getMessage();
    echo json_encode(['ok' => false, 'message' => $error]);
}
