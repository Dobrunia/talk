import './ui-kit/style.css';
import { renderProfile } from './ui-kit';
import { loadServers, serverClickHandler } from './utils/cache';

async function start() {
  //localStorage.setItem('username', 'Dobrunia');
  loadServers();
  renderProfile();
}
window.onload = () => {
  start();
};

window.serverClickHandler = serverClickHandler;