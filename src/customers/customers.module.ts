import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { Auth0Module } from 'src/auth0/auth0.module';

@Module({
	controllers: [CustomersController],
	imports: [Auth0Module, PrismaModule],
	providers: [CustomersService],
})
export class CustomersModule {}
