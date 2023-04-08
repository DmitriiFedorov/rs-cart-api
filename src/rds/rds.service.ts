import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class RdsService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: +process.env.DATABASE_PORT,
    });
  }

  async query(sql: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      // await this.client.connect();
      const result = (await client.query(sql, params)).rows;
      return result;
    } catch (e) {
      console.log({ e });
    } finally {
      // this.client.end();
      client.release();
    }
  }
}
