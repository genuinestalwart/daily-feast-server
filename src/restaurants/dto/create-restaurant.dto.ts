import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TrimString } from 'src/shared/decorators/trim-string.decorator';

export class CreateRestaurantDTO {
	@IsNotEmpty()
	@IsString()
	@MaxLength(30)
	@TrimString()
	name: string;
}
