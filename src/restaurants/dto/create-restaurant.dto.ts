import {
	IsEmail,
	IsNotEmpty,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';

export class CreateRestaurantDTO {
	@IsUrl()
	avatar: string;

	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(30)
	name: string;
}
