import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { GetMyMenuItemsQuery } from './get-my-menu-items-query.dto';

export class GetMenuItemsQuery extends OmitType(GetMyMenuItemsQuery, [
	'available',
	'status',
] as const) {
	@ApiProperty({ description: 'minimum 6 and in minutes' })
	@IsInt()
	@IsOptional()
	@Min(6)
	@Type(() => Number)
	maxPrepTime?: number;

	@ApiProperty({ description: 'minimum 2' })
	@IsOptional()
	@IsNumber()
	@Min(2)
	@Type(() => Number)
	maxPrice?: number;

	@ApiProperty({ description: 'minimum 5 and in minutes' })
	@IsInt()
	@IsOptional()
	@Min(5)
	@Type(() => Number)
	minPrepTime?: number;

	@ApiProperty({ description: 'minimum 1' })
	@IsInt()
	@IsOptional()
	@IsNumber()
	@IsPositive()
	@Type(() => Number)
	minPrice?: number;
}
