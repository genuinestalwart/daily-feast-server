import { Transform, Type } from 'class-transformer';
import {
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	Min,
} from 'class-validator';
import { Category } from 'prisma/generated/enums';

enum SortBy {
	created_at,
	price,
}

enum SortOrder {
	asc,
	desc,
}

export class GetMenuItemsDTO {
	@IsEnum(Category)
	@IsOptional()
	category?: 'DISH' | 'DRINK';

	@IsInt()
	@IsOptional()
	@Min(6)
	@Type(() => Number)
	maxPrepTime?: number;

	@IsOptional()
	@IsNumber()
	@IsPositive()
	@Type(() => Number)
	maxPrice?: number;

	@IsInt()
	@IsOptional()
	@Min(5)
	@Type(() => Number)
	minPrepTime?: number;

	@IsInt()
	@IsOptional()
	@IsNumber()
	@IsPositive()
	@Type(() => Number)
	minPrice?: number;

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

	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	take?: number;
}
