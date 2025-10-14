import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuItemsModule } from './menu-items/menu-items.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		MenuItemsModule,
		PrismaModule,
		RestaurantsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
