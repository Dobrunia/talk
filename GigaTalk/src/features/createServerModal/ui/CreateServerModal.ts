export function createServerModal() {
  const modal = document.createElement('div');
  modal.id = 'createServerModal';
  modal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // Заголовок модального окна
  const header = document.createElement('h2');
  header.textContent = 'Создать сервер';
  header.className = 'modal-header';
  modalContent.appendChild(header);

  // Форма для создания сервера
  const form = document.createElement('form');
  form.className = 'modal-form';

  // Поле для названия сервера
  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Название сервера';
  nameLabel.className = 'modal-label';
  form.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Введите название сервера';
  nameInput.className = 'modal-input';
  nameInput.required = true;
  form.appendChild(nameInput);

  // Поле для выбора аватара сервера
  const avatarLabel = document.createElement('label');
  avatarLabel.textContent = 'Аватар сервера';
  avatarLabel.className = 'modal-label';
  form.appendChild(avatarLabel);

  const avatarInput = document.createElement('input');
  avatarInput.type = 'file';
  avatarInput.accept = 'image/*';
  avatarInput.className = 'modal-input-file';
  form.appendChild(avatarInput);

  // Кнопка подтверждения
  const createButton = document.createElement('button');
  createButton.type = 'submit';
  createButton.textContent = 'Создать';
  createButton.className = 'button button-primary';
  form.appendChild(createButton);

  // Кнопка закрытия
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Закрыть';
  closeButton.className = 'button button-secondary';
  closeButton.addEventListener('click', () => {
    modal.remove();
  });

  modalContent.appendChild(form);
  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);

  // Обработчик отправки формы
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const serverName = nameInput.value;
    const avatarFile = avatarInput.files ? avatarInput.files[0] : null;

    if (!serverName) {
      alert('Введите название сервера');
      return;
    }

    // Логика создания сервера
    console.log('Сервер создан:', {
      name: serverName,
      avatar: avatarFile,
    });

    // Закрытие модального окна
    modal.remove();
  });

  document.body.appendChild(modal);
}
