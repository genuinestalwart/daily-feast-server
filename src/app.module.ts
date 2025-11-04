import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from './customers/customers.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { PrismaModule } from './prisma/prisma.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { auth } from 'express-oauth2-jwt-bearer';
import { Auth0Module } from './auth0/auth0.module';

// Auth0 middleware for token validation
const checkJWT = auth({
	audience: process.env.AUTH0_IDENTIFIER,
	issuerBaseURL: process.env.AUTH0_TENANT,
});

@Module({
	imports: [
		Auth0Module,
		ConfigModule.forRoot({ isGlobal: true }),
		CustomersModule,
		MenuItemsModule,
		PrismaModule,
		RestaurantsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(checkJWT).forRoutes('*');
	}
}
