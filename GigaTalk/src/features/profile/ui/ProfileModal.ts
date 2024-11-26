import { closeProfileModal, handleAvatarChange } from "../model/actions.ts";

export function renderProfileModal() {
  const profileModal = document.createElement('div');
  profileModal.id = 'profileModal';
  profileModal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  const header = document.createElement('h2');
  header.textContent = 'Поменять аватарку';
  header.className = 'header';
  modalContent.appendChild(header);

  // Форма для изменения аватара
  const avatarForm = document.createElement('form');
  avatarForm.id = 'avatarForm';
  avatarForm.className = 'form';
  avatarForm.onsubmit = (event) => handleAvatarChange(event);

  // Поле для загрузки аватара
  const fileInputContainer = document.createElement('div');
  const fileInputLabel = document.createElement('label');
  fileInputLabel.htmlFor = 'change_avatar';
  fileInputLabel.textContent = 'Новый аватар';
  fileInputLabel.className = 'modal-label';
  fileInputContainer.appendChild(fileInputLabel);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = 'change_avatar';
  fileInput.name = 'change_avatar';
  fileInput.accept = 'image/*';
  fileInput.className = 'input input-file';
  fileInputContainer.appendChild(fileInput);
  avatarForm.appendChild(fileInputContainer);

  // Предварительный просмотр изображения
  const previewContainer = document.createElement('div');
  const previewLabel = document.createElement('label');
  previewLabel.textContent = 'Предварительный просмотр:';
  previewLabel.className = 'modal-label';
  previewContainer.appendChild(previewLabel);

  const previewImageWrapper = document.createElement('div');
  const previewImage = document.createElement('img');
  previewImage.id = 'previewImage';
  previewImage.className = 'preview-image';
  previewImage.alt = 'Предварительный просмотр';
  previewImageWrapper.appendChild(previewImage);
  previewContainer.appendChild(previewImageWrapper);
  avatarForm.appendChild(previewContainer);

  // Кнопка для сохранения аватара
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.textContent = 'Сохранить аватар';
  saveButton.className = 'button button-primary';
  avatarForm.appendChild(saveButton);

  modalContent.appendChild(avatarForm);

  // Кнопка отмены
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Отмена';
  cancelButton.className = 'button button-secondary';
  cancelButton.onclick = () => closeProfileModal();
  modalContent.appendChild(cancelButton);

  profileModal.appendChild(modalContent);

  document.body.appendChild(profileModal);
}
