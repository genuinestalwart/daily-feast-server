import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [RestaurantsController],
	imports: [PrismaModule],
	providers: [RestaurantsService],
})
export class RestaurantsModule {}
