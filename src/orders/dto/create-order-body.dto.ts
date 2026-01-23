import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderType } from 'prisma/generated/enums';

export class CreateOrderBody {
	@ApiProperty({ enum: OrderType })
	@IsEnum(OrderType)
	type: OrderType;
}
