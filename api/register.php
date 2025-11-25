<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password = $input['password'] ?? '';
$mode = $input['mode'] ?? 'signup';

if (!$email || strlen($password) < 6) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Adresse e-mail invalide ou mot de passe trop court.',
    ]);
    exit;
}

require_once __DIR__ . '/../config.php';

$mysqli = @new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Connexion à la base impossible: ' . $mysqli->connect_error,
    ]);
    exit;
}

if (!$mysqli->set_charset('utf8mb4')) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Impossible de définir l\'encodage utf8mb4.',
    ]);
    $mysqli->close();
    exit;
}

$passwordHash = password_hash($password, PASSWORD_BCRYPT);

$query = 'INSERT INTO users (email, password_hash, mode) VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), mode = VALUES(mode), updated_at = CURRENT_TIMESTAMP';
$stmt = $mysqli->prepare($query);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la préparation de la requête.']);
    $mysqli->close();
    exit;
}

$stmt->bind_param('sss', $email, $passwordHash, $mode);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de l\'enregistrement utilisateur.']);
    $stmt->close();
    $mysqli->close();
    exit;
}

$stmt->close();
$mysqli->close();

echo json_encode([
    'status' => 'ok',
    'message' => $mode === 'signup'
        ? 'Compte créé et synchronisé avec la base MySQL.'
        : 'Connexion validée via MySQL.',
]);
