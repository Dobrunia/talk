export function createNetworkIndicator(): HTMLDivElement {
  const networkIndicator = document.createElement('div');
  networkIndicator.id = 'networkIndicator';
  networkIndicator.className = 'networkIndicator';

  const bar1 = document.createElement('div');
  bar1.id = 'bar1';
  bar1.className = 'bar1';

  const bar2 = document.createElement('div');
  bar2.id = 'bar2';
  bar2.className = 'bar2';

  const bar3 = document.createElement('div');
  bar3.id = 'bar3';
  bar3.className = 'bar3';

  networkIndicator.appendChild(bar1);
  networkIndicator.appendChild(bar2);
  networkIndicator.appendChild(bar3);

  return networkIndicator;
}
