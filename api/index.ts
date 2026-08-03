import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";
import { ValidationPipe } from "@nestjs/common";

const server = express();
let bootstrapPromise: Promise<void> | null = null;

export const bootstrap = async () => {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

      app.setGlobalPrefix("api/v1");

      app.enableCors({
        origin: [
          "https://eventory-pass-web.vercel.app",
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:5173",
        ],
        credentials: true,
      });

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          transformOptions: { enableImplicitConversion: true },
        }),
      );

      await app.init();
    })().catch((err) => {
      bootstrapPromise = null; // Allow retrying on subsequent requests
      console.error("NestJS bootstrap failed:", err);
      throw err;
    });
  }
  return bootstrapPromise;
};

export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};

