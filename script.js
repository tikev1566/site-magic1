const authModal = document.getElementById('auth-modal');
const backdrop = document.getElementById('backdrop');
const closeModalBtn = document.getElementById('close-modal');
const ctaButtons = [
  document.getElementById('cta-main'),
  document.getElementById('cta-secondary'),
  document.getElementById('cta-login'),
  document.getElementById('footer-login'),
  document.getElementById('nav-login'),
];
const form = document.getElementById('auth-form');
const signInButton = document.getElementById('sign-in');
const formMessage = document.getElementById('form-message');

function toggleModal(show) {
  if (!authModal || !backdrop) return;
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
  const email = form?.email?.value.trim();
  const password = form?.password?.value.trim();

  if (!email || !password || !formMessage) {
    if (formMessage) {
      formMessage.textContent = 'Merci de renseigner une adresse e-mail et un mot de passe.';
      formMessage.style.color = '#f5ad42';
    }
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
  if (!authModal || !backdrop || !form || !closeModalBtn) return;

  closeModalBtn.addEventListener('click', () => toggleModal(false));
  backdrop.addEventListener('click', () => toggleModal(false));
  ctaButtons.filter(Boolean).forEach((btn) => btn.addEventListener('click', () => toggleModal(true)));

  form.addEventListener('submit', (event) => handleAuth(event, 'signup'));
  signInButton?.addEventListener('click', (event) => handleAuth(event, 'signin'));
}

function initMatchForm() {
  const matchForm = document.getElementById('match-form');
  const matchMessage = document.getElementById('match-message');

  if (!matchForm) return;

  matchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const playerOne = matchForm.playerOne.value;
    const playerTwo = matchForm.playerTwo.value;
    const score = matchForm.score.value.trim();

    if (!playerOne || !playerTwo || !score) {
      if (matchMessage) {
        matchMessage.textContent = 'Merci de sélectionner deux joueurs et de renseigner le score.';
        matchMessage.style.color = '#f5ad42';
      }
      return;
    }

    if (playerOne === playerTwo) {
      if (matchMessage) {
        matchMessage.textContent = 'Choisissez deux joueurs différents.';
        matchMessage.style.color = '#f2695c';
      }
      return;
    }

    if (matchMessage) {
      matchMessage.textContent = `Résultat enregistré : ${playerOne} ${score} ${playerTwo}`;
      matchMessage.style.color = '#18d3a6';
    }
    matchForm.reset();
  });
}

function initPage() {
  initModal();
  initMatchForm();
}

document.addEventListener('DOMContentLoaded', initPage);
