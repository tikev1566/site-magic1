const authModal = document.getElementById('auth-modal');
const backdrop = document.getElementById('backdrop');
const closeModalBtn = document.getElementById('close-modal');
const ctaButtons = [
  document.getElementById('cta-main'),
  document.getElementById('cta-secondary'),
  document.getElementById('cta-login'),
  document.getElementById('footer-login'),
];
const form = document.getElementById('auth-form');
const signInButton = document.getElementById('sign-in');
const formMessage = document.getElementById('form-message');

function toggleModal(show) {
  if (show) {
    authModal.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } else {
    authModal.classList.add('hidden');
    backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function handleAuth(event, mode) {
  event.preventDefault();
  const email = form.email.value.trim();
  const password = form.password.value.trim();

  if (!email || !password) {
    formMessage.textContent = 'Merci de renseigner une adresse e-mail et un mot de passe.';
    formMessage.style.color = '#f5ad42';
    return;
  }

  formMessage.textContent = mode === 'signup'
    ? 'Compte créé ! Vous êtes prêt pour la saison.'
    : 'Connexion réussie. Chargement de votre profil…';
  formMessage.style.color = '#18d3a6';
  setTimeout(() => toggleModal(false), 1200);
}

function initModal() {
  toggleModal(true);

  closeModalBtn.addEventListener('click', () => toggleModal(false));
  backdrop.addEventListener('click', () => toggleModal(false));
  ctaButtons.filter(Boolean).forEach((btn) => btn.addEventListener('click', () => toggleModal(true)));

  form.addEventListener('submit', (event) => handleAuth(event, 'signup'));
  signInButton.addEventListener('click', (event) => handleAuth(event, 'signin'));
}

document.addEventListener('DOMContentLoaded', initModal);
