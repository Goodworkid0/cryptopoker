import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { Redis } from 'ioredis';
import { RedisStore } from 'connect-redis';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser
  app.use(cookieParser());

  // Redis session store
  const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6380'),
  });

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'cryptopoker:sess:',
  });

  // Session middleware
  app.use(
    session({
      store: redisStore,
      secret: process.env.SESSION_SECRET || 'cryptopoker-session-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      name: 'cryptopoker.sid',
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('CryptoPoker API')
    .setDescription('The CryptoPoker platform API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('cryptopoker.sid')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('wallet', 'Wallet & transactions')
    .addTag('tables', 'Poker tables')
    .addTag('games', 'Game management')
    .addTag('tournaments', 'Tournament management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 CryptoPoker API running on http://localhost:${port}`);
  console.log(`📚 API Docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
