import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app, { swaggerUi: false });
  await app.init();
  return app;
}

export const http = (app: INestApplication) => request(app.getHttpServer());

export const resetDatabase = (app: INestApplication) => app.get(DataSource).query('TRUNCATE onboarding_session');

export const STEP_BODIES = {
  1: { fullName: 'Bjoni Murati', email: 'bjoni@example.com' },
  2: { country: 'AL', city: 'Tirana' },
  3: { acceptTerms: true },
} as const;

export async function startSession(app: INestApplication): Promise<string> {
  const res = await http(app).post('/api/onboarding');
  expect(res.status).toBe(201);
  return res.body.id;
}

export const submit = (app: INestApplication, id: string, step: number, body: object) =>
  http(app).patch(`/api/onboarding/${id}/steps/${step}`).send(body);
