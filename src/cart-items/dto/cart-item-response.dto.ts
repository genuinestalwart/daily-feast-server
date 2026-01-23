import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsPositive,
	IsString,
	IsUrl,
	IsUUID,
} from 'class-validator';
import { Category } from 'prisma/generated/enums';

class CartItem_MenuItemResponse {
	@ApiProperty({ enum: Category })
	@IsEnum(Category)
	category: Category;

	@IsUrl()
	image: string;

	@IsString()
	name: string;

	@IsInt()
	@IsPositive()
	price: number;
}

export class CartItemResponse {
	@IsUUID()
	id: string;

	@IsInt()
	@IsPositive()
	amount: number;

	@IsString()
	customer_id: string;

	menu_item: CartItem_MenuItemResponse;

	@IsUUID()
	menu_item_id: string;
}

export class UpdateAmountResponse extends OmitType(CartItemResponse, [
	'amount',
] as const) {
	@IsInt()
	amount: number;

	@IsBoolean()
	deleted: boolean;
}
