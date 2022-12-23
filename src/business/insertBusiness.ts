import { prisma } from '@prisma/client';

export class Business {
  id: string;
  name?: string;
  admin?: string;
  fb?: string;
  shopify?: string;

  constructor(id: string) {
    this.id = id;
  }
}
