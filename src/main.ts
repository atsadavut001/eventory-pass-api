import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set Global Prefix to match the API Contract
  app.setGlobalPrefix("api/v1");

  // Enable CORS for frontend integration
  app.enableCors({
    origin: true, // Allow all origins for dev simplicity, or configure specific frontend URLs
    credentials: true,
  });

  // Enable Global Validation Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
