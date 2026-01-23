import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from 'prisma/generated/enums';

export class UpdateStatusBody {
	@ApiProperty({ enum: OrderStatus })
	@IsEnum(OrderStatus)
	status: OrderStatus;
}
