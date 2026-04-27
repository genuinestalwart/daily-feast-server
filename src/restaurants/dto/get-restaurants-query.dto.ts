import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsEnum,
	IsInt,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';

export enum RestaurantSortBy {
	completedOrdersCount = 'completedOrdersCount',
	created_at = 'created_at',
	name = 'name',
}

export enum RestaurantSortOrder {
	asc = 'asc',
	desc = 'desc',
}

export class GetRestaurantsQuery {
	@ApiProperty({ description: 'text to search for' })
	@IsOptional()
	@IsString()
	search?: string;

	@ApiProperty({ description: 'number of restaurants to skip before taking' })
	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	skip?: number;

	@ApiProperty({ description: 'case-sensitive' })
	@IsEnum(RestaurantSortBy)
	@IsOptional()
	sort_by?: RestaurantSortBy;

	@ApiProperty({ description: 'case-sensitive' })
	@IsEnum(RestaurantSortOrder)
	@IsOptional()
	sort_order?: RestaurantSortOrder;

	@ApiProperty({
		description: 'number of restaurants to take after skipping',
	})
	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	take?: number;
}
