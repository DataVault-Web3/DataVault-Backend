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
        network: "base-sepolia",
        config: {
          description: "Download dataset after payment verification",
        }
      }
    },
    {
      url: process.env.X402_FACILITATOR_URL, // Polygon Amoy facilitator
    }
  ));
  
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,
  //   forbidNonWhitelisted: true,
  //   transform: true,
  // }));

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://www.amazon.in',
      'https://amazon.in',
      'https://www.amazon.com',
      'https://amazon.com',
      'chrome-extension://*' // Allow Chrome extensions
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });


  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
