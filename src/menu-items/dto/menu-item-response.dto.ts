import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDate,
	IsEnum,
	IsIn,
	IsInt,
	IsNotIn,
	IsPositive,
	IsString,
	IsUrl,
	IsUUID,
	Min,
} from 'class-validator';
import { Category, MenuItemStatus } from 'prisma/generated/enums';

export class MenuItemResponse {
	@IsUUID()
	id: string;

	@ApiProperty({ enum: Category })
	@IsEnum(Category)
	category: Category;

	@IsDate()
	created_at: Date;

	@IsString()
	description: string;

	@IsUrl()
	image: string;

	@IsString()
	name: string;

	@IsInt()
	@Min(5)
	prep_time: number;

	@IsInt()
	@IsPositive()
	price: number;

	@IsString()
	restaurant_id: string;

	@IsDate()
	updated_at: Date;
}

export class MyMenuItemResponse extends MenuItemResponse {
	@IsBoolean()
	available: boolean;

	@ApiProperty({ enum: MenuItemStatus })
	@IsEnum(MenuItemStatus)
	status: string;
}

export class CreateMenuItemResponse extends MenuItemResponse {
	@IsBoolean()
	available: true;

	@IsIn(['KEPT_AS_DRAFT'])
	status: string;
}

export class UpdateMenuItemResponse extends MenuItemResponse {
	@IsBoolean()
	available: boolean;

	@IsNotIn(['DENIED'])
	status: string;
}

export class SubmitMenuItemResponse extends MenuItemResponse {
	@IsBoolean()
	available: boolean;

	@IsIn(['PENDING_APPROVAL'])
	status: string;
}
