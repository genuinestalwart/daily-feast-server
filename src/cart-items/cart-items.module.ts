import { Module } from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { CartItemsController } from './cart-items.controller';
import { Auth0Module } from 'src/auth0/auth0.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [CartItemsController],
	imports: [Auth0Module, PrismaModule],
	providers: [CartItemsService],
})
export class CartItemsModule {}
