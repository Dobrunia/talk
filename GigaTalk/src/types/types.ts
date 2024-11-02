type channelType = 'voice' | 'text';

export type serverDATA = {
  id: string;
  imageUrl: string;
  name: string;
  categories?: category[];
};

export type category = {
  id: string;
  name: string;
  channels?: channel[];
};

export type channel = {
  id: string;
  name: string;
  type: channelType;
};
