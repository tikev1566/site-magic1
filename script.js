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

async function handleAuth(event, mode) {
  event.preventDefault();
  const email = form.email.value.trim();
  const password = form.password.value.trim();

  if (!email || !password) {
    formMessage.textContent = 'Merci de renseigner une adresse e-mail et un mot de passe.';
    formMessage.style.color = '#f5ad42';
    return;
  }

  formMessage.textContent = 'Connexion au serveur…';
  formMessage.style.color = '#18d3a6';

  try {
    const response = await fetch('auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: mode, email, password }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.message || 'Une erreur est survenue.');
    }

    formMessage.textContent = data.message;
    formMessage.style.color = '#18d3a6';
    setTimeout(() => toggleModal(false), 1200);
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.style.color = '#f2695c';
  }
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
