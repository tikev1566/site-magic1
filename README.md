# Magic Arena Saison

Site vitrine pour organiser une saison de tournois Magic: The Gathering Arena. L'expérience met en avant :

- Un calendrier de tournois (formats Standard, Draft, Explorer).
- Un tableau de classement avec points et invitations.
- Un historique de saison pour revoir les moments forts.
- Une fenêtre d'authentification qui invite les visiteurs à créer un compte ou se connecter dès l'arrivée.

## Démarrage

Ouvrez simplement `index.html` dans votre navigateur pour prévisualiser la page.

## Connexion PHP + MySQL (InfinityFree)

Le formulaire d'authentification envoie désormais les données vers un endpoint PHP (`api/register.php`) qui insère ou met à jour l'utilisateur dans MySQL. Si GitHub affiche des caractères étranges, forcez l'encodage UTF-8 ou consultez le fichier directement dans votre éditeur.

1. Renseignez vos identifiants dans `config.php` (ou via les variables d'environnement `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`).
2. Créez la table `users` sur votre base InfinityFree :

   ```sql
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL,
     mode ENUM('signup','signin') DEFAULT 'signup',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```
3. Déployez les fichiers (dont le dossier `api/`) à la racine de votre hébergement. Le JavaScript appellera automatiquement `api/register.php` lors des créations de comptes ou connexions.
4. Sur InfinityFree, conservez `index.html` comme page d'accueil : PHP n'est nécessaire que pour l'endpoint et sera exécuté dès qu'il est appelé par fetch.
