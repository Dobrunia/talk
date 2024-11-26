import { userApi } from '../../../entities/user/api.ts';
import { setUserAvatar } from '../../../entities/user/model/actions.ts';

export async function handleAvatarChange(event: Event): Promise<void> {
  event.preventDefault();
  const avatarInput = document.getElementById(
    'change_avatar',
  ) as HTMLInputElement | null;

  if (avatarInput && avatarInput.files && avatarInput.files.length > 0) {
    const file = avatarInput.files[0];
    const reader = new FileReader();

    reader.onload = async function () {
      if (reader.result) {
        const base64String = reader.result.toString();

        try {
          const response = await userApi.changeAvatar(base64String);

          if (response.userAvatar) {
            console.log('Аватар успешно обновлен:', response);
            setUserAvatar(response.userAvatar);
            //renderProfile();
            closeProfileModal();
            alert(response.message || 'Аватар успешно обновлен');
          } else {
            console.error('Ошибка сервера:', response);
            alert(
              `Ошибка: ${response.message || 'Не удалось обновить аватар'}`,
            );
          }
        } catch (error) {
          const err = error as any;
          if (err.response?.status === 413) {
            alert(
              `Ошибка: Размер файла слишком велик. Пожалуйста, выберите файл меньшего размера.`,
            );
            return;
          } else {
            console.error('Ошибка при отправке данных на сервер:', error);
            alert('Произошла ошибка при обновлении аватара. Попробуйте позже.');
          }
        }
      }
    };

    reader.onerror = function () {
      console.error('Ошибка при чтении файла:', reader.error);
      alert('Произошла ошибка при преобразовании файла.');
    };

    reader.readAsDataURL(file); // Инициализация чтения файла как Data URL
  } else {
    alert('Выберите файл аватара');
  }
}

export function openProfileModal() {
  const profileModal = document.getElementById('profileModal');
  if (profileModal) {
    profileModal.classList.remove('hidden');
  }
}

export function closeProfileModal() {
  const profileModal = document.getElementById('profileModal');
  if (profileModal) {
    profileModal.classList.add('hidden');
  }
}
