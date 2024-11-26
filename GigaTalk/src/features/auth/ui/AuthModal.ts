import { guestLogin, handleLogin, handleRegister } from '../model/actions.ts';

export function renderAuthModal() {
  const authModal = document.createElement('div');
  authModal.id = 'authModal';
  authModal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  const header = document.createElement('div');
  header.className = 'modal-header';

  const loginTab = document.createElement('button');
  loginTab.id = 'loginTab';
  loginTab.className = 'button-tab button-tab-active';
  loginTab.textContent = 'Вход';
  loginTab.addEventListener('click', showLogin);
  header.appendChild(loginTab);

  const registerTab = document.createElement('button');
  registerTab.id = 'registerTab';
  registerTab.className = 'button-tab button-tab-inactive';
  registerTab.textContent = 'Регистрация';
  registerTab.addEventListener('click', showRegister);
  header.appendChild(registerTab);

  modalContent.appendChild(header);

  // Форма входа
  const loginForm = document.createElement('form');
  loginForm.id = 'loginForm';
  loginForm.className = 'form';
  loginForm.onsubmit = (event) => handleLogin(event);

  const loginUsernameGroup = createInputGroup(
    'Имя пользователя',
    'loginUsername',
    'username',
    'text',
  );
  const loginPasswordGroup = createInputGroup(
    'Пароль',
    'loginPassword',
    'password',
    'password',
  );

  const loginButton = document.createElement('button');
  loginButton.type = 'submit';
  loginButton.className = 'button button-primary';
  loginButton.textContent = 'Войти';

  loginForm.appendChild(loginUsernameGroup);
  loginForm.appendChild(loginPasswordGroup);
  loginForm.appendChild(loginButton);

  modalContent.appendChild(loginForm);

  // Форма регистрации
  const registerForm = document.createElement('form');
  registerForm.id = 'registerForm';
  registerForm.className = 'form hidden';
  registerForm.onsubmit = (event) => handleRegister(event);

  const registerUsernameGroup = createInputGroup(
    'Имя пользователя',
    'registerUsername',
    'username',
    'text',
  );
  const registerPasswordGroup = createInputGroup(
    'Пароль',
    'registerPassword',
    'password',
    'password',
  );
  const registerConfirmPasswordGroup = createInputGroup(
    'Подтвердите пароль',
    'registerConfirmPassword',
    'confirmPassword',
    'password',
  );

  const registerButton = document.createElement('button');
  registerButton.type = 'submit';
  registerButton.className = 'button button-primary';
  registerButton.textContent = 'Зарегистрироваться';

  registerForm.appendChild(registerUsernameGroup);
  registerForm.appendChild(registerPasswordGroup);
  registerForm.appendChild(registerConfirmPasswordGroup);
  registerForm.appendChild(registerButton);

  modalContent.appendChild(registerForm);

  // Кнопка для входа как гость
  const guestButton = document.createElement('button');
  guestButton.className = 'button button-secondary';
  guestButton.textContent = 'Войти как гость';
  guestButton.addEventListener('click', guestLogin);

  modalContent.appendChild(guestButton);

  authModal.appendChild(modalContent);

  document.body.appendChild(authModal);
}

/**
 * Вспомогательная функция для создания группы полей ввода
 */
function createInputGroup(
  labelText: string,
  inputId: string,
  inputName: string,
  inputType: string,
) {
  const group = document.createElement('div');

  const label = document.createElement('label');
  label.htmlFor = inputId;
  label.className = 'modal-label';
  label.textContent = labelText;

  const input = document.createElement('input');
  input.type = inputType;
  input.id = inputId;
  input.name = inputName;
  input.autocomplete = 'username';
  input.required = true;
  input.className = 'modal-input';

  group.appendChild(label);
  group.appendChild(input);

  return group;
}

function toggleElementClass(
  elementId: string,
  className: string,
  action: 'add' | 'remove' | 'toggle',
) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList[action](className);
  } else {
    console.warn(`Element with id "${elementId}" not found.`);
  }
}

export function showLogin() {
  toggleElementClass('loginForm', 'hidden', 'remove');
  toggleElementClass('registerForm', 'hidden', 'add');

  // Переключаем активные и неактивные классы для вкладок
  toggleElementClass('loginTab', 'button-tab-active', 'add');
  toggleElementClass('loginTab', 'button-tab-inactive', 'remove');
  toggleElementClass('registerTab', 'button-tab-active', 'remove');
  toggleElementClass('registerTab', 'button-tab-inactive', 'add');
}

function showRegister() {
  toggleElementClass('registerForm', 'hidden', 'remove');
  toggleElementClass('loginForm', 'hidden', 'add');

  // Переключаем активные и неактивные классы для вкладок
  toggleElementClass('registerTab', 'button-tab-active', 'add');
  toggleElementClass('registerTab', 'button-tab-inactive', 'remove');
  toggleElementClass('loginTab', 'button-tab-active', 'remove');
  toggleElementClass('loginTab', 'button-tab-inactive', 'add');
}

export function openAuthModal() {
  toggleElementClass('authModal', 'hidden', 'remove');
}

export function closeAuthModal() {
  toggleElementClass('authModal', 'hidden', 'add');
}
