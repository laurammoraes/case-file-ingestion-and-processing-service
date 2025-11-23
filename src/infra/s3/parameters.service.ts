/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable } from '@nestjs/common';

@Injectable()
export class ParametersService {
  PG_DATABASE_URL = '';

  AWS_REGION: string = '';
  AWS_ACCESS_KEY_ID: string = '';
  AWS_SECRET_ACCESS_KEY: string = '';

  constructor() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const errors: string[] = [];

    Object.entries(this).forEach(([key, staticValue]: [string, string]) => {
      const envValue = process.env[key] as string;

      const newValue = envValue || staticValue;

      if (!newValue) {
        errors.push(key);
      }

      this[key] = newValue;
    });

    if (errors.length > 0) {
      throw new Error(
        `Missing .env variables:\n${errors.reduce((acc, key) => acc + key + '\n', '')}`,
      );
    }
  }
}
