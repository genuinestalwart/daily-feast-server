import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
	DocumentBuilder,
	SwaggerCustomOptions,
	SwaggerDocumentOptions,
	SwaggerModule,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { Auth0ExceptionFilter } from './common/filters/auth0-exception.filter';

const bootstrap = async () => {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	app.useGlobalFilters(
		new PrismaExceptionFilter(),
		new Auth0ExceptionFilter(),
	);

	app.useGlobalPipes(
		new ValidationPipe({ transform: true, whitelist: true }),
	);

	const config = new DocumentBuilder()
		.addBearerAuth()
		.setTitle('Daily Feast APIs')
		.setVersion('1.0')
		.build();

	const documentOptions: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) =>
			methodKey,
	};

	const documentFactory = () =>
		SwaggerModule.createDocument(app, config, documentOptions);

	const isDev = process.env.NODE_ENV === 'development';
	const customOptions: SwaggerCustomOptions = { ui: isDev, raw: isDev };
	SwaggerModule.setup('api', app, documentFactory, customOptions);
	await app.listen(process.env.PORT ?? 5000);
};

bootstrap()
	.then(() => {})
	.catch(() => {});
