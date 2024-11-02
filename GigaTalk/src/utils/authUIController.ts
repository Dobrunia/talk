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
  try {
    toggleElementClass('loginForm', 'hidden', 'remove');
    toggleElementClass('registerForm', 'hidden', 'add');

    // Переключаем активные и неактивные классы для вкладок
    toggleElementClass('loginTab', 'auth-tab-active', 'add');
    toggleElementClass('loginTab', 'auth-tab-inactive', 'remove');
    toggleElementClass('registerTab', 'auth-tab-active', 'remove');
    toggleElementClass('registerTab', 'auth-tab-inactive', 'add');
  } catch (error) {
    console.error('An error occurred while showing the login form:', error);
  }
}

export function showRegister() {
  try {
    toggleElementClass('registerForm', 'hidden', 'remove');
    toggleElementClass('loginForm', 'hidden', 'add');

    // Переключаем активные и неактивные классы для вкладок
    toggleElementClass('registerTab', 'auth-tab-active', 'add');
    toggleElementClass('registerTab', 'auth-tab-inactive', 'remove');
    toggleElementClass('loginTab', 'auth-tab-active', 'remove');
    toggleElementClass('loginTab', 'auth-tab-inactive', 'add');
  } catch (error) {
    console.error('An error occurred while showing the register form:', error);
  }
}

export function closeAuthModal() {
  try {
    toggleElementClass('authModal', 'hidden', 'add');
  } catch (error) {
    console.error('An error occurred while closing the auth modal:', error);
  }
}
