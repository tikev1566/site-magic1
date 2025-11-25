<?php
/**
 * Simple authentication endpoint for InfinityFree MySQL hosting.
 *
 * Exposes two actions:
 *  - signup: creates a user with username + hashed password
 *  - signin: verifies credentials and returns a welcome message
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Répondre positivement aux pré-vols CORS (OPTIONS) déclenchés
// par les requêtes fetch JSON depuis InfinityFree ou d'autres hôtes.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Méthode non autorisée (POST requis).']);
    exit;
}

// Database credentials
// InfinityFree expose les variables suivantes dans le panneau :
//  - MYSQL_HOST
//  - MYSQL_DB
//  - MYSQL_USER
//  - MYSQL_PASSWORD
// Des alias sans underscore et DB_* sont également acceptés pour faciliter
// le déploiement sur d'autres hébergeurs.
$host = getenv('MYSQL_HOST')
    ?: getenv('DB_HOST')
    ?: getenv('MYSQLHOST');
$dbName = getenv('MYSQL_DB')
    ?: getenv('DB_NAME')
    ?: getenv('MYSQLDB');
$user = getenv('MYSQL_USER')
    ?: getenv('DB_USER')
    ?: getenv('MYSQLUSER');
$password = getenv('MYSQL_PASSWORD')
    ?: getenv('DB_PASS')
    ?: getenv('MYSQLPASSWORD');
$port = getenv('DB_PORT') ?: '3306';

// Refuser de continuer si les identifiants sont manquants pour éviter des
// erreurs de connexion (SQLSTATE[HY000] [1045]) et informer clairement l'utilisateur.
if (!$host || !$dbName || !$user) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => "Configuration de base de données manquante. Renseignez MYSQL_HOST, MYSQL_DB, MYSQL_USER et MYSQL_PASSWORD.",
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = $input['action'] ?? 'signup';
$username = trim($input['username'] ?? '');
$plainPassword = $input['password'] ?? '';

if (strlen($username) < 3) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => "Le nom d'utilisateur doit contenir au moins 3 caractères."]);
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
        username VARCHAR(190) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

    if ($action === 'signup') {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);

        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['ok' => false, 'message' => "Un compte existe déjà avec ce nom d'utilisateur."]);
            exit;
        }

        $hashedPassword = password_hash($plainPassword, PASSWORD_BCRYPT);
        $insert = $pdo->prepare('INSERT INTO users (username, password) VALUES (?, ?)');
        $insert->execute([$username, $hashedPassword]);

        echo json_encode(['ok' => true, 'message' => 'Compte créé avec succès.']);
        exit;
    }

    if ($action === 'signin') {
        $stmt = $pdo->prepare('SELECT id, password FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $userRow = $stmt->fetch();

        if (!$userRow || !password_verify($plainPassword, $userRow['password'])) {
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
