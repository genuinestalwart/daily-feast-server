import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from './customers/customers.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { PrismaModule } from './prisma/prisma.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { auth } from 'express-oauth2-jwt-bearer';
import { Auth0Module } from './auth0/auth0.module';
import { RidersModule } from './riders/riders.module';
import { CommonModule } from './common/common.module';

// Auth0 middleware for token validation
const checkJWT = auth({
	audience: `${process.env.AUTH0_IDENTIFIER}`,
	issuerBaseURL: `${process.env.AUTH0_TENANT}`,
});

@Module({
	imports: [
		Auth0Module,
		ConfigModule.forRoot({ isGlobal: true }),
		CommonModule,
		CustomersModule,
		MenuItemsModule,
		PrismaModule,
		RestaurantsModule,
		RidersModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(checkJWT)
			.exclude(
				{ path: '/', method: RequestMethod.GET },
				{ path: 'favicon.ico', method: RequestMethod.GET },
				{ path: 'menu-items', method: RequestMethod.GET },
				{ path: 'menu-items/:id', method: RequestMethod.GET },
				{ path: 'restaurants', method: RequestMethod.GET },
				{ path: 'restaurants/:id', method: RequestMethod.GET },
			)
			.forRoutes('*');
	}
}
