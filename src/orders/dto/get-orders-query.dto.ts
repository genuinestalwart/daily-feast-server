import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, OrderType } from 'prisma/generated/enums';

export class GetOrdersQuery {
	@ApiProperty({ enum: OrderStatus })
	@IsEnum(OrderStatus)
	@IsOptional()
	status?: OrderStatus;

	@ApiProperty({ enum: OrderType })
	@IsEnum(OrderType)
	@IsOptional()
	type?: OrderType;
}
