import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';

@Injectable()
export class ProductsService {
  private dynamo: AWS.DynamoDB.DocumentClient;

  constructor() {
    this.dynamo = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });
  }

  async getProductsByIds(ids: string[]) {
    if (ids.length === 0) return [];

    const tableName = process.env.PRODUCTS_TABLE_NAME;

    const params = {
      RequestItems: {
        [tableName]: {
          Keys: ids.map(id => ({
            id,
          })),
        },
      },
    };

    try {
      const products = (await this.dynamo.batchGet(params).promise()).Responses[
        tableName
      ];

      return products;
    } catch (error) {
      console.log({ error });
    }
  }
}
