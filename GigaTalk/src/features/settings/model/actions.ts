import { userStore } from "../../../entities/user/model/store";

export function logOut() {
  const confirmation = window.confirm('Вы уверены, что хотите выйти?');
  if (confirmation) {
    // Логика выхода из аккаунта
    localStorage.removeItem('token');
    userStore.resetState();
    window.location.reload(); // Обновление страницы для удаления всех сессий и кэшированных данных
  } else {
    console.log('Выход из аккаунта отменен');
  }
}
