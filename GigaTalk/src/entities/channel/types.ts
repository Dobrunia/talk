type channelType = 'voice' | 'text';

export type Channel = {
  id: string;
  name: string;
  type: channelType;
};
