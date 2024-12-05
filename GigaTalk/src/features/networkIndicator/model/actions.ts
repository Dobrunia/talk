import { Transport } from "mediasoup-client/lib/types";

function updateNetworkIndicator(status: 'good' | 'fair' | 'bad') {
  const bar1 = document.getElementById('bar1');
  const bar2 = document.getElementById('bar2');
  const bar3 = document.getElementById('bar3');
  if (!bar1 || !bar2 || !bar3) return;

  // Reset all bars
  bar1.classList.remove('bg-green-500', 'bg-yellow-500', 'bg-red-500');
  bar2.classList.remove(
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-gray-400',
  );
  bar3.classList.remove(
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-gray-400',
  );

  if (status === 'good') {
    bar1.classList.add('bg-green-500');
    bar2.classList.add('bg-green-500');
    bar3.classList.add('bg-green-500');
  } else if (status === 'fair') {
    bar1.classList.add('bg-yellow-500');
    bar2.classList.add('bg-yellow-500');
    bar3.classList.add('bg-gray-400'); // Gray for inactive bar
  } else if (status === 'bad') {
    bar1.classList.add('bg-red-500');
    bar2.classList.add('bg-gray-400'); // Gray for inactive bars
    bar3.classList.add('bg-gray-400');
  }
}

export async function monitorConnectionQuality(transport: Transport): Promise<void> {
  if (!transport) return;
  try {
    const stats = await transport.getStats();

    let latency = 0;
    let packetLoss = 0;
    let jitter = 0;

    stats.forEach((report) => {
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = report.currentRoundTripTime || 0;
      }
      if (report.type === 'inbound-rtp' || report.type === 'outbound-rtp') {
        packetLoss = report.packetsLost || 0;
        jitter = report.jitter || 0;
      }
    });

    // Логика определения состояния
    if (latency > 300 || packetLoss > 5 || jitter > 30) {
      updateNetworkIndicator('bad');
    } else if (latency > 150 || packetLoss > 2 || jitter > 15) {
      updateNetworkIndicator('fair');
    } else {
      updateNetworkIndicator('good');
    }
    console.log(`Latency: ${latency}ms, Packet Loss: ${packetLoss}%, Jitter: ${jitter}ms`);
  } catch (error) {
    console.error('Error getting transport stats:', error);
  }
}
