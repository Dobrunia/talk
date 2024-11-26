import { Channel } from "../channel/types.ts";

export type serverDATA = {
  id: string;
  imageUrl: string;
  name: string;
  categories?: Category[];
};

export type Category = {
  id: string;
  name: string;
  channels?: Channel[];
};