import { AppData, Transport } from 'mediasoup-client/lib/types';

export function updateNetworkIndicator(status: 'good' | 'average' | 'poor') {
  const bar1 = document.getElementById('bar1');
  const bar2 = document.getElementById('bar2');
  const bar3 = document.getElementById('bar3');
  if (!bar1 || !bar2 || !bar3) return;

  // Reset all bars
  bar1.classList.remove('bg-green-500', 'bg-yellow-500', 'bg-red-500');
  bar2.classList.remove('bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-gray-400');
  bar3.classList.remove('bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-gray-400');

  if (status === 'good') {
    bar1.classList.add('bg-green-500');
    bar2.classList.add('bg-green-500');
    bar3.classList.add('bg-green-500');
  } else if (status === 'average') {
    bar1.classList.add('bg-yellow-500');
    bar2.classList.add('bg-yellow-500');
    bar3.classList.add('bg-gray-400'); // Gray for inactive bar
  } else if (status === 'poor') {
    bar1.classList.add('bg-red-500');
    bar2.classList.add('bg-gray-400'); // Gray for inactive bars
    bar3.classList.add('bg-gray-400');
  }
}

export function checkTransportStatus(transport: Transport<AppData> | null) {
  if (transport === null) return;
  if (transport.connectionState === 'connected') {
    updateNetworkIndicator('good');
  } else if (transport.connectionState === 'connecting') {
    updateNetworkIndicator('average');
  } else {
    updateNetworkIndicator('poor');
  }
}
