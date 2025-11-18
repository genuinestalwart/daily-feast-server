import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateRestaurantDTO {
	@IsNotEmpty()
	@IsString()
	@MaxLength(30)
	name?: string;

	@IsUrl()
	picture?: string;
}
