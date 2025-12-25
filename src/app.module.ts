import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Auth0Module } from './auth0/auth0.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from './customers/customers.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { PrismaModule } from './prisma/prisma.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { RidersModule } from './riders/riders.module';

@Module({
	imports: [
		Auth0Module,
		CartItemsModule,
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
export class AppModule {}
