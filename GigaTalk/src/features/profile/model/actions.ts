import { userApi } from '../../../entities/user/api.ts';
import { setUserAvatar } from '../../../entities/user/model/actions.ts';

export async function handleAvatarChange(event: Event): Promise<void> {
  event.preventDefault();
  const target = event.target as HTMLFormElement; // Приводим event.target к форме
  const avatarInput = target.querySelector(
    'input[name="change_avatar"]',
  ) as HTMLInputElement;

  if (avatarInput && avatarInput.files && avatarInput.files.length > 0) {
    const file = avatarInput.files[0];
    const reader = new FileReader();

    reader.onload = async function (e) {
      const result = e.target?.result as string | null;
      if (result) {
        try {
          const response = await userApi.changeAvatar(result);

          if (response.userAvatar) {
            console.log('Аватар успешно обновлен:', response);
            setUserAvatar(response.userAvatar);
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
