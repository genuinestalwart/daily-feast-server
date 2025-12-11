import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

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

	@ApiProperty({
		description: 'number of restaurants to take after skipping',
	})
	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	take?: number;
}
