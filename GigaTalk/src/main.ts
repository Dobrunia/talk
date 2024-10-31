import './ui-kit/style.css';
import { serverDATA } from './types/types';
import { renderProfile, renderServersAndAttachListeners } from './ui-kit';

const DATA: serverDATA[] = [
  {
    id: 1,
    imageUrl: '/1.gif',
    name: 'Название Сервера 1',
    category: [
      {
        id: 1,
        name: 'первая категория',
        channels: [
          {
            id: 1,
            name: 'первый войс канал',
            type: 'voice',
          },
        ],
      },
      {
        id: 2,
        name: 'вторая категория',
        channels: [
          {
            id: 2,
            name: '2 войс канал',
            type: 'voice',
          },
        ],
      },
    ],
  },
];

function start() {
  localStorage.setItem('username', 'Dobrunia');
  renderServersAndAttachListeners(DATA);
  renderProfile();
}
start();