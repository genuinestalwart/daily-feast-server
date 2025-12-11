import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { TrimString } from 'src/common/decorators/trim-string.decorator';

export class UpdateRiderBody {
	@IsNotEmpty()
	@IsString()
	@MaxLength(30)
	@TrimString()
	name?: string;

	@IsUrl()
	@TrimString()
	picture?: string;
}
