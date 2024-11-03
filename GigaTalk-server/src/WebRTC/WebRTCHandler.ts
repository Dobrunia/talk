import WebSocket from 'ws';

// Список активных клиентов и каналов
type Client = {
  id: string;
  ws: WebSocket;
  serverId: string;
  channelId: string;
};

// Хранилище для клиентов по серверу и каналу
const clients: Client[] = [];

// Функция для регистрации нового клиента
export function registerClient(
  ws: WebSocket,
  id: string,
  serverId: string,
  channelId: string,
) {
  console.log('registerClient ', id, serverId, channelId);

  // Проверка на первый клиент в канале
  const clientsInChannel = clients.filter(
      (client) => client.serverId === serverId && client.channelId === channelId
  );

  const isInitiator = clientsInChannel.length === 0;
  clients.push({ id, ws, serverId, channelId });

  if (isInitiator) {
      // Задержка перед инициацией связи
      setTimeout(() => {
          ws.send(JSON.stringify({
              type: 'initiator',
              message: 'You are the initiator of the conversation. Waiting for another participant...',
          }));
          console.log(`User ${id} is the initiator in channel ${channelId}`);
      }, 5000); // Таймер на 5 секунд
  }
}

// Функция для удаления клиента при отключении
export function unregisterClient(ws: WebSocket) {
  const index = clients.findIndex((client) => client.ws === ws);
  console.log('unregisterClient ');
  if (index !== -1) {
    clients.splice(index, 1);
  }
}

// Пересылка сообщения в пределах канала
export function broadcastToChannel(
  senderWs: WebSocket,
  serverId: string,
  channelId: string,
  message: any,
) {
  message.type = `server_` + message.type;
  const messageString = JSON.stringify(message);
  //   console.log('содержимое ', messageString)
  console.log('clients ', clients);
  if(clients.length <= 1) {//человек 1 в канале
    console.log('Нет клиентов в канале');
    return; // выходим из функции, если нет клиентов в канале.
  }
  clients.forEach((client) => {
    console.log(
      'client.serverId ',
      client.serverId,
      ' serverId ',
      serverId,
      'client.channelId ',
      client.channelId,
      ' channelId ',
      channelId,
    );
    if (
      client.ws !== senderWs && // Не отправляем сообщение отправителю
      client.serverId === serverId &&
      client.channelId === channelId &&
      client.ws.readyState === WebSocket.OPEN
    ) {
      client.ws.send(messageString);
      console.log('Не отправляем сообщение отправителю ', clients);
    }
  });
}
