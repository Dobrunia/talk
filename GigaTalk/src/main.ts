import {
  serverListElement,
  serverListAddServerElement,
  serverName,
  serverCategory,
} from './components/components';
import './style.css';
import { serverDATA } from './types';

const DATA: serverDATA[] = [
  {
    id: 1,
    imageUrl: '/1.gif',
    serverName: 'Название Сервера 1',
    category: [
      {
        id: 1,
        categoryName: 'первая категория',
        channels: [
          {
            id: 1,
            channelName: 'первый войс канал',
            type: 'voice',
          },
        ],
      },
    ],
  },
];

function addServerClickListener() {
  const servers = document.querySelectorAll('.server_element');
  servers.forEach((server) => {
    server.addEventListener('click', () => {
      const serverId = server.getAttribute('data-id');
      renderServerInfo(DATA);
    });
  });
}

function renderServersAndAttachListeners(DATA: serverDATA[]) {
  const server_list = document.getElementById('servers_list');
  if (!server_list) {
    console.error('Server list container not found!');
    return;
  }
  let htmlContent = serverListAddServerElement();
  DATA.forEach((element) => {
    htmlContent += serverListElement(element);
  });
  server_list.insertAdjacentHTML('beforeend', htmlContent);
  addServerClickListener();
}
renderServersAndAttachListeners(DATA);

function renderServerInfo(DATA: serverDATA[]) {
  let htmlContent = serverName(DATA[0].serverName);
  DATA[0].category?.forEach((element) => {
    htmlContent += serverCategory(element);
  });
  const server_slot = document.getElementById('server_components_block');
  if (!server_slot) {
    console.error('Server info container not found!');
    return;
  }
  server_slot.innerHTML = htmlContent;
}

const microSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="26px" height="26px"><path d="M 18 3 C 16.35503 3 15 4.3550302 15 6 L 15 33 C 15 34.64497 16.35503 36 18 36 L 32 36 C 33.64497 36 35 34.64497 35 33 L 35 6 C 35 4.3550302 33.64497 3 32 3 L 18 3 z M 18 5 L 32 5 C 32.56503 5 33 5.4349698 33 6 L 33 24 L 17 24 L 17 6 C 17 5.4349698 17.43497 5 18 5 z M 11.984375 17.986328 A 1.0001 1.0001 0 0 0 11 19 L 11 34 C 11 37.301625 13.698375 40 17 40 L 22 40 L 22 46 L 17 46 A 1.0001 1.0001 0 1 0 17 48 L 22.832031 48 A 1.0001 1.0001 0 0 0 23.158203 48 L 26.832031 48 A 1.0001 1.0001 0 0 0 27.158203 48 L 33 48 A 1.0001 1.0001 0 1 0 33 46 L 28 46 L 28 40 L 33 40 C 36.301625 40 39 37.301625 39 34 L 39 19 A 1.0001 1.0001 0 1 0 37 19 L 37 34 C 37 36.220375 35.220375 38 33 38 L 27.167969 38 A 1.0001 1.0001 0 0 0 26.841797 38 L 23.154297 38 A 1.0001 1.0001 0 0 0 22.984375 37.986328 A 1.0001 1.0001 0 0 0 22.839844 38 L 17 38 C 14.779625 38 13 36.220375 13 34 L 13 19 A 1.0001 1.0001 0 0 0 11.984375 17.986328 z M 17 26 L 33 26 L 33 33 C 33 33.56503 32.56503 34 32 34 L 18 34 C 17.43497 34 17 33.56503 17 33 L 17 26 z M 25 28 A 2 2 0 0 0 25 32 A 2 2 0 0 0 25 28 z M 24 40 L 26 40 L 26 46 L 24 46 L 24 40 z" fill="#FFFFFF" /></svg>`;
const headphonesSVG = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg height="24px" width="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
   viewBox="0 0 512 512" xml:space="preserve">
<path style="fill:#FFFFFF;" d="M408.183,189.987c-5.407,0-10.619-2.966-13.235-8.117c-26.776-52.719-80.019-85.468-138.949-85.468
  s-112.171,32.749-138.949,85.466c-3.709,7.303-12.638,10.213-19.939,6.506c-7.303-3.709-10.217-12.638-6.508-19.941
  C122.466,105.708,185.841,66.74,255.999,66.74s133.534,38.967,165.396,101.696c3.709,7.303,0.796,16.23-6.508,19.94
  C412.736,189.468,410.441,189.987,408.183,189.987z"/>
<path style="fill:#FFFFFF;" d="M423.652,476.549l-34.167-5.495l24.648-153.264l34.167,5.495
  c26.417,4.249,44.39,29.109,40.141,55.526l-9.262,57.595C474.929,462.826,450.069,480.798,423.652,476.549z"/>
<path style="fill:#FFFFFF;" d="M491.888,334.047c-9.903-13.698-24.547-22.72-41.235-25.403l-19.524-3.14l1.845-11.47
  c1.301-8.087-4.202-15.697-12.288-16.998l-79.072-12.716c-3.887-0.627-7.856,0.319-11.043,2.624c-3.187,2.305-5.33,5.78-5.955,9.664
  l-33.047,205.49c-1.301,8.087,4.202,15.697,12.288,16.998l79.072,12.716c0.785,0.126,1.572,0.188,2.355,0.188
  c3.1,0,6.145-0.973,8.688-2.812c3.187-2.305,5.33-5.781,5.955-9.664l1.845-11.47l19.524,3.14c3.341,0.537,6.741,0.81,10.104,0.81
  c31.208,0,57.457-22.391,62.418-53.239l9.264-57.597C505.767,364.479,501.791,347.745,491.888,334.047z M323.21,472.164
  l28.336-176.205l49.787,8.006l-9.815,61.038l-16.676,103.697c0,0.001,0,0.003,0,0.004l-1.844,11.466L323.21,472.164z
   M473.797,376.458l-9.264,57.597c-2.636,16.39-16.569,28.286-33.133,28.286c-1.792,0-3.607-0.147-5.396-0.433l-19.524-3.14
  l7.201-44.78l12.737-79.198l19.524,3.14c8.866,1.425,16.645,6.219,21.906,13.496C473.11,358.702,475.222,367.592,473.797,376.458z"
  />
<path style="fill:#FFFFFF;" d="M88.347,476.549l34.167-5.495L97.867,317.792l-34.167,5.495
  c-26.417,4.249-44.39,29.109-40.142,55.526l9.262,57.595C37.07,462.826,61.93,480.798,88.347,476.549z"/>
<path style="fill:#FFFFFF;" d="M255.999,0C116.974,0,3.869,113.105,3.869,252.13c0,29.029,4.888,57.389,14.511,84.438
  c-8.627,13.204-11.985,28.921-9.464,44.6l9.264,57.595c4.961,30.847,31.211,53.238,62.417,53.239c0,0,0.001,0,0.003,0
  c3.362,0,6.762-0.273,10.104-0.81l19.524-3.14l1.845,11.47c0.624,3.883,2.766,7.359,5.955,9.664
  c2.544,1.839,5.588,2.812,8.688,2.812c0.783,0,1.572-0.062,2.355-0.188l79.072-12.716c8.087-1.301,13.588-8.911,12.288-16.998
  l-18.736-116.503c-1.301-8.087-8.905-13.593-16.998-12.288c-8.087,1.301-13.588,8.911-12.288,16.998l16.381,101.86l-49.787,8.006
  l-1.844-11.466c0-0.001,0-0.003,0-0.004l-16.676-103.697l-9.815-61.038l49.787-8.006l2.415,15.02
  c1.301,8.086,8.905,13.591,16.998,12.288c8.087-1.301,13.588-8.911,12.288-16.998l-4.77-29.662
  c-0.624-3.884-2.766-7.359-5.955-9.664c-3.187-2.305-7.162-3.251-11.043-2.624l-79.072,12.716
  c-8.087,1.301-13.588,8.911-12.288,16.998l1.845,11.47l-19.524,3.14c-6.674,1.072-13.011,3.175-18.858,6.17
  c-5.943-20.252-8.957-41.257-8.957-62.682c0-122.669,99.799-222.467,222.467-222.467s222.467,99.799,222.467,222.467
  c0,8.191,6.64,14.831,14.831,14.831s14.831-6.64,14.831-14.831C508.128,113.105,395.024,0,255.999,0z M66.056,337.93l19.524-3.14
  l12.737,79.198l7.201,44.78l-19.524,3.14c-1.79,0.288-3.605,0.433-5.396,0.433l0,0c-16.563-0.001-30.497-11.898-33.133-28.287
  l-9.264-57.595c-1.425-8.866,0.687-17.756,5.947-25.034S57.19,339.355,66.056,337.93z"/>
</svg>`;

localStorage.setItem('username', 'Dobrunia');
function myProfile() {
  const profile = document.getElementById('my_profile');
  if (!profile) {
    console.error('My profile container not found!');
    return;
  }
  let htmlContent = '';
  const username = localStorage.getItem('username');
  htmlContent += `<div class="profile_avatar">
  </div><div class="profile_name">${username}</div>
  <div class="profile_buttons">${microSVG}${headphonesSVG}</div>`;
  profile.innerHTML = htmlContent;
}
myProfile();
