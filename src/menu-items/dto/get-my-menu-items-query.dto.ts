import { ApiProperty } from '@nestjs/swagger';
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
	created_at = 'created_at',
	price = 'price',
	updated_at = 'updated_at',
}

enum SortOrder {
	asc = 'asc',
	desc = 'desc',
}

export class GetMyMenuItemsQuery {
	@IsBoolean()
	@IsOptional()
	@Type(() => Boolean)
	available?: boolean;

	@ApiProperty({ description: 'case-sensitive', enum: Category })
	@IsEnum(Category)
	@IsOptional()
	category?: Category;

	@ApiProperty({ description: 'text to search for' })
	@IsOptional()
	@IsString()
	search?: string;

	@ApiProperty({ description: 'number of items to skip before taking' })
	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	skip?: number;

	@ApiProperty({ description: 'case-sensitive' })
	@IsEnum(SortBy)
	@IsOptional()
	@Transform(({ value }) => value ?? SortBy.created_at)
	sort_by?: SortBy;

	@ApiProperty({ description: 'case-sensitive' })
	@IsEnum(SortOrder)
	@IsOptional()
	@Transform(({ value }) => value ?? SortOrder.desc)
	sort_order?: SortOrder;

	@ApiProperty({ enum: MenuItemStatus })
	@IsEnum(MenuItemStatus)
	@IsOptional()
	status?: MenuItemStatus;

	@ApiProperty({ description: 'number of items to take after skipping' })
	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	take?: number;
}
