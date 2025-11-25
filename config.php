<?php
// Configuration de la base de données pour InfinityFree ou autre hébergeur PHP.
// Renseignez les variables d'environnement ou remplacez les valeurs par défaut.

if (!defined('DB_HOST')) {
    define('DB_HOST', getenv('DB_HOST') ?: 'sqlxxx.infinityfree.com');
}

if (!defined('DB_NAME')) {
    define('DB_NAME', getenv('DB_NAME') ?: 'your_database');
}

if (!defined('DB_USER')) {
    define('DB_USER', getenv('DB_USER') ?: 'your_username');
}

if (!defined('DB_PASSWORD')) {
    define('DB_PASSWORD', getenv('DB_PASSWORD') ?: 'your_password');
}

if (!defined('DB_PORT')) {
    define('DB_PORT', (int) (getenv('DB_PORT') ?: 3306));
}

?>
