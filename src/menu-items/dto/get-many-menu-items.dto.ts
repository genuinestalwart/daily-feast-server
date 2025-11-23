import { Transform, Type } from 'class-transformer';
import {
	ArrayMaxSize,
	IsArray,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	MaxLength,
	Min,
} from 'class-validator';
import { Category } from 'prisma/generated/enums';

export class GetManyMenuItemsDTO {
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
	name?: string;

	@IsOptional()
	@IsString()
	restaurant_id?: string;

	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	skip?: number;

	@ArrayMaxSize(10)
	@IsArray()
	@IsOptional({ each: true })
	@IsString({ each: true })
	@MaxLength(15, { each: true })
	@Transform(({ value }) =>
		typeof value === 'string' ? value.toLowerCase().split(',') : value,
	)
	tags?: string[];

	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	take?: number;
}
