import {
  getInCheck,
  logInRender,
  logOut,
} from '../features/auth/model/actions.ts';
import { renderAuthModal } from '../features/auth/ui/AuthModal.ts';
import './style.css';

async function start() {
  renderAuthModal();
  if (await getInCheck()) {
    await logInRender();
  } else {
    logOut();
  }
}

window.onload = () => {
  start();
};
