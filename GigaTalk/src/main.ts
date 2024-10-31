import './ui-kit/style.css';
import { serverDATA } from './types/types';
import { renderProfile, renderServersAndAttachListeners } from './ui-kit';
import { serverApi } from './api/serverApi';

// const DATA: serverDATA[] = [
//   {
//     id: 1,
//     imageUrl: '/1.gif',
//     name: 'Название Сервера 1',
//     categories: [
//       {
//         id: 1,
//         name: 'первая категория',
//         channels: [
//           {
//             id: 1,
//             name: 'первый войс канал',
//             type: 'voice',
//           },
//         ],
//       },
//       {
//         id: 2,
//         name: 'вторая категория',
//         channels: [
//           {
//             id: 2,
//             name: '2 войс канал',
//             type: 'voice',
//           },
//         ],
//       },
//     ],
//   },
// ];

async function start() {
  localStorage.setItem('username', 'Dobrunia');
  const DATA = await serverApi.getAllServers();
  if (!DATA) {
    return;
  }
  renderServersAndAttachListeners(DATA);
  renderProfile();
}
start();