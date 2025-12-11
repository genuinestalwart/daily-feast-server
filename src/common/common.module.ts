import { Module } from '@nestjs/common';
import { Auth0Module } from 'src/auth0/auth0.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './services/users.service';

@Module({
	imports: [Auth0Module, PrismaModule],
	exports: [UsersService],
	providers: [UsersService],
})
export class CommonModule {}
