import { OmitType } from '@nestjs/swagger';
import {
	IsBoolean,
	IsInt,
	IsPositive,
	IsString,
	IsUUID,
} from 'class-validator';

export class CartItemResponse {
	@IsInt()
	@IsPositive()
	amount: number;

	@IsString()
	customer_id: string;

	@IsUUID()
	id: string;

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
