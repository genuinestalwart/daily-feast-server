import { IsBoolean, IsDate, IsEmail, IsString, IsUrl } from 'class-validator';

export class UserResponse {
	@IsDate()
	created_at: Date;

	@IsEmail()
	email: string;

	@IsBoolean()
	email_verified: boolean;

	@IsString()
	id: string;

	@IsString()
	name: string;

	@IsUrl()
	picture: string;

	@IsDate()
	updated_at: Date;
}
