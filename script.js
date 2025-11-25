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

const contentDefaults = {
  heroTitle: 'Arpentez la nouvelle saison',
  heroLead:
    "Planifiez vos tournois, suivez votre classement et revivez vos moments clés au sein d'une expérience raffinée pour les joueurs passionnés.",
  heroPill: 'Prochaine étape: Open Dominaria, 14 juin',
  heroProgress: 42,
  heroProgressMetric: '42% des tournois complétés',
  heroDetailOne: '10/24 tournois joués',
  heroDetailTwo: 'Classement moyen: Top 25',
  heroDetailThree: '3 invitations aux Masters',
};

const ADMIN_PASSWORD = 'mage-secret';

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
  const username = form?.username?.value.trim();
  const password = form?.password?.value.trim();

  if (!username || !password || !formMessage) {
    if (formMessage) {
      formMessage.textContent = "Merci de renseigner un nom d'utilisateur et un mot de passe.";
      formMessage.style.color = '#f5ad42';
    }
    return;
  }

  formMessage.textContent = 'Connexion au serveur…';
  formMessage.style.color = '#18d3a6';

  try {
    const body = new URLSearchParams({ action: mode, username, password });

    const response = await fetch('auth.php', {
      method: 'POST',
      body,
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Réponse inattendue du serveur. Vérifiez que PHP est bien activé.');
    }

    if (!response.ok || !data.ok) {
      throw new Error(data?.message || `Erreur ${response.status || ''}`.trim());
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

function loadCustomContent() {
  const rawContent = localStorage.getItem('customContent');
  let customContent = {};

  try {
    customContent = rawContent ? JSON.parse(rawContent) : {};
  } catch (error) {
    console.warn('Impossible de lire les contenus personnalisés :', error);
  }

  const content = { ...contentDefaults, ...customContent };

  document.querySelectorAll('[data-content-key]').forEach((element) => {
    const key = element.dataset.contentKey;
    const value = content[key] ?? element.dataset.default;
    if (typeof value !== 'undefined') {
      element.textContent = value;
    }
  });

  const progressBar = document.querySelector('[data-progress-key="heroProgress"]');
  if (progressBar) {
    const progressValue = Number(content.heroProgress || contentDefaults.heroProgress);
    const clamped = Math.min(100, Math.max(0, progressValue));
    progressBar.style.width = `${clamped}%`;
  }
}

function initAdminPage() {
  const accessForm = document.getElementById('admin-access');
  const adminGate = document.getElementById('admin-gate');
  const adminPanel = document.getElementById('admin-panel');
  const adminMessage = document.getElementById('admin-message');
  const accessMessage = document.getElementById('admin-access-message');
  const resetButton = document.getElementById('reset-content');
  const adminForm = document.getElementById('admin-form');

  if (!adminForm || !accessForm || !adminGate || !adminPanel) {
    return;
  }

  const populateForm = (values = {}) => {
    const content = { ...contentDefaults, ...values };
    Object.entries(content).forEach(([key, value]) => {
      const input = adminForm.elements.namedItem(key);
      if (input) {
        input.value = value;
      }
    });
  };

  let saved = {};
  try {
    const rawContent = localStorage.getItem('customContent');
    saved = rawContent ? JSON.parse(rawContent) : {};
  } catch (error) {
    console.warn('Impossible de charger les données enregistrées :', error);
  }
  populateForm(saved);

  accessForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const password = event.target.password?.value ?? '';
    if (password !== ADMIN_PASSWORD) {
      if (accessMessage) {
        accessMessage.textContent = 'Mot de passe incorrect.';
        accessMessage.style.color = '#f2695c';
      }
      return;
    }

    adminGate.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    if (accessMessage) accessMessage.textContent = '';
  });

  adminForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(adminForm);
    const values = Object.fromEntries(formData.entries());

    const progress = Number(values.heroProgress);
    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      if (adminMessage) {
        adminMessage.textContent = 'La progression doit être comprise entre 0 et 100.';
        adminMessage.style.color = '#f2695c';
      }
      return;
    }

    localStorage.setItem('customContent', JSON.stringify({
      ...contentDefaults,
      ...values,
      heroProgress: progress,
    }));

    if (adminMessage) {
      adminMessage.textContent = "Enregistré ! Rechargez la page d'accueil pour voir les changements.";
      adminMessage.style.color = '#18d3a6';
    }
  });

  resetButton?.addEventListener('click', () => {
    localStorage.removeItem('customContent');
    populateForm(contentDefaults);
    if (adminMessage) {
      adminMessage.textContent = 'Valeurs réinitialisées.';
      adminMessage.style.color = '#18d3a6';
    }
  });
}

function initPage() {
  loadCustomContent();
  initModal();
  initMatchForm();
  initAdminPage();
}

document.addEventListener('DOMContentLoaded', initPage);
