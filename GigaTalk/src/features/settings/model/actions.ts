import { logOut } from "../../auth/model/actions";

export function logOutConfirme() {
  const confirmation = window.confirm('Вы уверены, что хотите выйти?');
  if (confirmation) {
    logOut();
  } else {
    console.log('Выход из аккаунта отменен');
  }
}
