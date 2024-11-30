function createNetworkIndicator() {
  // Создаем основной контейнер для индикатора сети
  const networkIndicator = document.createElement('div');
  networkIndicator.id = 'networkIndicator';
  networkIndicator.className = 'networkIndicator';

  // Полоска 1
  const bar1 = document.createElement('div');
  bar1.id = 'bar1';
  bar1.className = 'bar1';

  // Полоска 2
  const bar2 = document.createElement('div');
  bar2.id = 'bar2';
  bar2.className = 'bar2';

  // Полоска 3
  const bar3 = document.createElement('div');
  bar3.id = 'bar3';
  bar3.className = 'bar3';

  // Добавляем полоски в контейнер
  networkIndicator.appendChild(bar1);
  networkIndicator.appendChild(bar2);
  networkIndicator.appendChild(bar3);

  // Вставляем индикатор в DOM (например, в body)
  document.body.appendChild(networkIndicator);
}
