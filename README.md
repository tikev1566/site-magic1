# Magic Arena Saison

Site vitrine pour organiser une saison de tournois Magic: The Gathering Arena. L'expérience met en avant :

- Un calendrier de tournois (formats Standard, Draft, Explorer).
- Un tableau de classement avec points et invitations.
- Un historique de saison pour revoir les moments forts.
- Une fenêtre d'authentification qui invite les visiteurs à créer un compte ou se connecter dès l'arrivée.

## Démarrage

Ouvrez simplement `index.html` dans votre navigateur pour prévisualiser la page.

## Hébergement InfinityFree

Le site est prêt pour un hébergement en HTTP (InfinityFree) : les polices Google et les avatars utilisent désormais des URLs explicites en `http://` afin d'éviter les avertissements de contenu mixte lorsque le domaine ne force pas le HTTPS.

### Endpoint d'authentification PHP

- Le fichier `auth.php` fournit une API minimaliste pour créer et vérifier des comptes.
- Configurez les identifiants MySQL d'InfinityFree via des variables d'environnement (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_PORT`) ou remplacez les valeurs par défaut dans le fichier.
- La table `users` est créée automatiquement si elle n'existe pas (id, email unique, mot de passe hashé, date de création).
- Les actions acceptées sont `signup` (inscription) et `signin` (connexion), à envoyer en JSON :

```bash
curl -X POST https://votre-domaine.infinityfreeapp.com/auth.php \\
  -H 'Content-Type: application/json' \\
  -d '{"action":"signup","email":"planeswalker@arena.gg","password":"secret123"}'
```

Le frontend envoie également les formulaires de la modale vers `auth.php` via `fetch`.
