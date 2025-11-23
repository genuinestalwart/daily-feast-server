import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { TrimString } from 'src/shared/decorators/trim-string.decorator';

export class UpdateRestaurantDTO {
	@IsNotEmpty()
	@IsString()
	@MaxLength(30)
	@TrimString()
	name?: string;

	@IsUrl()
	@TrimString()
	picture?: string;
}
