import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class GetRestaurantsDTO {
	@IsOptional()
	@IsString()
	search?: string;

	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	skip?: number;

	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	take?: number;
}
