import './ui-kit/style.css';
import { renderProfile } from './ui-kit';
import { loadServers, serverClickHandler } from './utils/cache';

async function start() {
  loadServers();
}
window.onload = () => {
  start();
};

window.serverClickHandler = serverClickHandler;