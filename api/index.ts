import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";
import { ValidationPipe } from "@nestjs/common";

const server = express();

export const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.setGlobalPrefix("api/v1");

  app.enableCors({
    origin: true,
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
};

bootstrap();

export default server;
