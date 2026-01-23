import { ApiProperty } from '@nestjs/swagger';
import {
	IsDate,
	IsEnum,
	IsInt,
	IsOptional,
	IsPositive,
	IsString,
	IsUUID,
} from 'class-validator';
import { OrderStatus, OrderType } from 'prisma/generated/enums';

class Order_CommonResponse {
	@IsUUID()
	id: string;

	@IsString()
	name: string;
}

class Order_OrderedItems_MenuItemResponse extends Order_CommonResponse {}

class Order_OrderedItemsResponse {
	@IsUUID()
	id: string;

	@IsInt()
	@IsPositive()
	amount: number;

	@IsInt()
	@IsPositive()
	price_per_item: number;

	@ApiProperty({ nullable: true })
	@IsOptional()
	menu_item: Order_OrderedItems_MenuItemResponse | null;
}

class Order_RestaurantResponse extends Order_CommonResponse {}

export class OrderResponse {
	@IsUUID()
	id: string;

	@IsDate()
	created_at: Date;

	@ApiProperty({ nullable: true })
	@IsOptional()
	@IsString()
	customer_id: string | null;

	ordered_items: Order_OrderedItemsResponse[];

	@ApiProperty({ nullable: true })
	@IsOptional()
	restaurant: Order_RestaurantResponse | null;

	@ApiProperty({ nullable: true })
	@IsOptional()
	@IsString()
	rider_id: string | null;

	@ApiProperty({ enum: OrderStatus })
	@IsEnum(OrderStatus)
	status: OrderStatus;

	@ApiProperty({ enum: OrderType })
	@IsEnum(OrderType)
	type: OrderType;

	@IsInt()
	@IsPositive()
	total_price: number;

	@IsDate()
	updated_at: Date;
}
