type channelType = 'voice' | 'text';

export type serverDATA = {
  id: number;
  imageUrl: string;
  name: string;
  category?: category[];
};

export type category = {
  id: number;
  name: string;
  channels?: channel[];
};

export type channel = {
  id: number;
  name: string;
  type: channelType;
};
