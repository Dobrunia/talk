type channelType = 'voice' | 'text';

export type Channel = {
  id: string;
  name: string;
  type: channelType;
};

export type ChannelStoreState = {
  currentChannel: Channel | null;
};
