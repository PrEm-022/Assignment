// Constants & DOM Elements
const STORAGE_KEY_LINKS = 'biostack_links';
const STORAGE_KEY_PROFILE = 'biostack_profile';

const themeToggle = document.getElementById('themeToggle');
const verifiedBadge = document.getElementById('verifiedBadge');
const followerInput = document.getElementById('followerCount');
const nameInput = document.getElementById('inputName');
const handleInput = document.getElementById('inputHandle');
const creatorName = document.getElementById('creatorName');
const creatorHandle = document.getElementById('creatorHandle');
const avatarEl = document.getElementById('avatarEl');
const linksList = document.getElementById('linksList');
const inputTitle = document.getElementById('inputTitle');
const inputUrl = document.getElementById('inputUrl');
const errTitle = document.getElementById('errTitle');
const errUrl = document.getElementById('errUrl');
const btnAdd = document.getElementById('btnAdd');
const statLinks = document.getElementById('statLinks');
const statFollowers = document.getElementById('statFollowers');
const statStatus = document.getElementById('statStatus');

// Storage Functions
function saveLinks(links) {
  localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
}

function loadLinks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_LINKS)) || [];
  } catch {
    return [];
  }
}

function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PROFILE)) || { name: '', handle: '', followers: 0 };
  } catch {
    return { name: '', handle: '', followers: 0 };
  }
}

// Validation Functions
function isValidUrl(url) {
  const urlRegex = /^https:\/\/([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/i;
  return urlRegex.test(url.trim());
}

function isEmpty(str) {
  return !str || !str.trim();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getIconForUrl(url) {
  if (/youtube|youtu\.be/i.test(url)) return '▶️';
  if (/instagram/i.test(url)) return '📸';
  if (/twitter|x\.com/i.test(url)) return '𝕏';
  if (/tiktok/i.test(url)) return '🎵';
  if (/github/i.test(url)) return '💻';
  if (/linkedin/i.test(url)) return '💼';
  return '🔗';
}

// Update verified badge and stats
function updateVerifiedBadge(followers) {
  const count = parseInt(followers, 10) || 0;
  verifiedBadge.style.display = count >= 1000 ? 'inline-block' : 'none';
  statFollowers.textContent = count >= 1000 ? (count / 1000).toFixed(1) + 'k' : count;
  statStatus.textContent = count >= 100000 ? 'Pro ✦' : count >= 10000 ? 'Rising ⚡' : count >= 1000 ? 'Verified ✓' : 'Starter';
}

// Render links list
function renderLinks(links) {
  if (!links.length) {
    linksList.innerHTML = `<div class="empty-state"><span class="empty-icon">🔗</span>No links yet. Add your first social link above!</div>`;
    statLinks.textContent = '0';
    return;
  }

  statLinks.textContent = links.length;
  const html = links.map(link => `
    <div class="link-card" data-id="${link.id}">
      <div class="link-icon">${getIconForUrl(link.url)}</div>
      <a class="link-main" href="${link.url}" target="_blank" rel="noopener noreferrer">
        <div class="link-title">${escapeHtml(link.title)}</div>
        <div class="link-url">${link.url}</div>
      </a>
      <button class="btn-remove" data-id="${link.id}" title="Remove link">✕</button>
    </div>
  `).join('');
  linksList.innerHTML = html;
}

// Update profile display
function updateProfile(name, handle) {
  const displayName = name || 'Your Name';
  const displayHandle = handle || '@handle';
  creatorName.textContent = displayName;
  creatorHandle.textContent = displayHandle.startsWith('@') ? displayHandle : '@' + displayHandle;
  avatarEl.textContent = displayName[0]?.toUpperCase() || 'C';
}

// Event Listeners
linksList.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-remove');
  if (!btn) return;
  const id = btn.dataset.id;
  let links = loadLinks();
  links = links.filter(l => l.id !== id);
  saveLinks(links);
  renderLinks(links);
});

// Add link
btnAdd.addEventListener('click', () => {
  const title = inputTitle.value.trim();
  const url = inputUrl.value.trim();
  let valid = true;

  inputTitle.classList.remove('error');
  errTitle.classList.remove('show');
  inputUrl.classList.remove('error');
  errUrl.classList.remove('show');

  if (isEmpty(title)) {
    inputTitle.classList.add('error');
    errTitle.classList.add('show');
    valid = false;
  }
  if (!isValidUrl(url)) {
    inputUrl.classList.add('error');
    errUrl.classList.add('show');
    valid = false;
  }

  if (!valid) return;

  let links = loadLinks();
  links.push({ id: Date.now().toString(), title, url });
  saveLinks(links);
  renderLinks(links);

  inputTitle.value = '';
  inputUrl.value = '';
  inputTitle.focus();
});

// Enter key submits
[inputTitle, inputUrl].forEach(el => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnAdd.click();
  });
});

// Live profile preview
nameInput.addEventListener('input', () => {
  const profile = loadProfile();
  profile.name = nameInput.value;
  saveProfile(profile);
  updateProfile(nameInput.value, handleInput.value);
});

handleInput.addEventListener('input', () => {
  const profile = loadProfile();
  profile.handle = handleInput.value;
  saveProfile(profile);
  updateProfile(nameInput.value, handleInput.value);
});

// Follower count
followerInput.addEventListener('input', () => {
  const val = parseInt(followerInput.value, 10) || 0;
  const profile = loadProfile();
  profile.followers = val;
  saveProfile(profile);
  updateVerifiedBadge(val);
});

// Theme functions
const STORAGE_KEY_THEME = 'biostack_theme';

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem(STORAGE_KEY_THEME, newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const label = themeToggle.querySelector('#themeLabel');
  const icon = themeToggle.querySelector('#themeIcon');
  if (theme === 'dark') {
    icon.textContent = '☀️';
    if (label) label.textContent = 'Light';
  } else {
    icon.textContent = '🌙';
    if (label) label.textContent = 'Dark';
  }
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY_THEME) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeButton(saved);
}

themeToggle.addEventListener('click', toggleTheme);

// Initialize
(function init() {
  initTheme();
  
  const links = loadLinks();
  const profile = loadProfile();

  if (profile.name) nameInput.value = profile.name;
  if (profile.handle) handleInput.value = profile.handle;
  if (profile.followers) followerInput.value = profile.followers;

  updateProfile(profile.name, profile.handle);
  updateVerifiedBadge(profile.followers);
  renderLinks(links);
})();