import { Module } from '@nestjs/common';
import { RidersService } from './riders.service';
import { RidersController } from './riders.controller';
import { Auth0Module } from 'src/auth0/auth0.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [RidersController],
	imports: [Auth0Module, PrismaModule],
	providers: [RidersService],
})
export class RidersModule {}
