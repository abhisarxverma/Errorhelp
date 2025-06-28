const backdrop = findById("backdrop")

export const blackListUploads = [
    'node_modules', '.git', '.DS_Store', 'Thumbs.db', 'desktop.ini',
    '.idea', '.vscode', 'env', '__pycache__', '.pytest_cache',
    'package-lock.json', 'yarn.lock', 'npm-debug.log', 'Pipfile.lock',
    'database.sqlite', 'db.sqlite3', '.png', '.jpg', '.svg'
  ];

export function findById(id) {
    let element = document.getElementById(id);
    return element;
}

export function find(cls) {
    let element = document.querySelector(cls);
    return element;
}

export function findAll(cls) {
    let elements = document.querySelectorAll(cls);
    return elements;
}

export function show(element) {
    element.classList.remove("hide")
    element.classList.add("show")
}

export function hide(element) {
    element.classList.remove("show")
    element.classList.add("hide")
}

export function showTopMessage(message) {
  const el = document.getElementById('top-general-message');
  el.textContent = message;
  el.classList.add('show');

  setTimeout(() => {
    el.classList.remove('show');
  }, 2000);
}

export function showTopErrorMessage(message) {
  const el = document.getElementById('top-error-message');
  el.textContent = message;
  el.classList.add('show');

  setTimeout(() => {
    el.classList.remove('show');
  }, 2000);
}

export function secureFetch(url, options = {}) {
  const csrf = getCSRFToken();
  options.headers = {
    ...(options.headers || {}),
    'X-CSRFToken': csrf,
  };
  return fetch(url, options);
}

function getCSRFToken() {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

export function showPopup(popup) {
  popup.style.display = "block"
  backdrop.style.display = "block"
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
}

export function hidePopup(popup) {
  popup.style.display = "none"
  backdrop.style.display = "none"
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
}

export function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => showTopMessage("Copied to Clipboard."))
      .catch(err => console.error("Failed to copy:", err));
}