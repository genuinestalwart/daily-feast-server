import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { Auth0Module } from 'src/auth0/auth0.module';

@Module({
	controllers: [RestaurantsController],
	imports: [Auth0Module, PrismaModule],
	providers: [RestaurantsService],
})
export class RestaurantsModule {}
