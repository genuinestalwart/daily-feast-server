import { Transform, Type } from 'class-transformer';
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';
import { Category, MenuItemStatus } from 'prisma/generated/enums';

enum SortBy {
	created_at,
	price,
	updated_at,
}

enum SortOrder {
	asc,
	desc,
}

export class GetMyMenuItemsDTO {
	@IsBoolean()
	@IsOptional()
	@Type(() => Boolean)
	available?: boolean;

	@IsEnum(Category)
	@IsOptional()
	category?: Category;

	@IsOptional()
	@IsString()
	search?: string;

	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	skip?: number;

	@IsEnum(SortBy)
	@IsOptional()
	@Transform(({ value }) => value ?? SortBy.created_at)
	sort_by?: SortBy;

	@IsEnum(SortOrder)
	@IsOptional()
	@Transform(({ value }) => value ?? SortOrder.desc)
	sort_order?: SortOrder;

	@IsEnum(MenuItemStatus)
	@IsOptional()
	status?: MenuItemStatus;

	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	take?: number;
}
