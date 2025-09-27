import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { paymentMiddleware } from 'x402-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure X402 payment middleware
  app.use(paymentMiddleware(
    process.env.X402_WALLET_ADDRESS, // receiving wallet address
    {
      "GET /datasets/*/download": {
        price: "$0.001", // 1 cent in USD
        network: "polygon-amoy",
        config: {
          description: "Download dataset after payment verification",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Dataset ID" }
            }
          },
          outputSchema: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              downloadUrl: { type: "string" },
              fileSize: { type: "string" },
              format: { type: "string" }
            }
          }
        }
      }
    },
    {
      url: process.env.X402_FACILITATOR_URL, // Polygon Amoy facilitator
    }
  ));
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
