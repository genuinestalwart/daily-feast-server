import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { Auth0Module } from 'src/auth0/auth0.module';
import { CommonModule } from 'src/common/common.module';

@Module({
	controllers: [CustomersController],
	imports: [Auth0Module, CommonModule, PrismaModule],
	providers: [CustomersService],
})
export class CustomersModule {}
