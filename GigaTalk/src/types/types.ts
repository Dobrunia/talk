type channelType = 'voice' | 'text';

export type serverDATA = {
  id: number;
  imageUrl: string;
  serverName: string;
  category?: category[];
};

export type category = {
  id: number;
  categoryName: string;
  channels?: channel[];
};

export type channel = {
  id: number;
  channelName: string;
  type: channelType;
};
