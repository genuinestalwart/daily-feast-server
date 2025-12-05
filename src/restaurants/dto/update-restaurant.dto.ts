import {
	ArrayMaxSize,
	ArrayNotEmpty,
	IsArray,
	IsNotEmpty,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';
import { TrimString } from 'src/shared/decorators/trim-string.decorator';
import { Transform } from 'class-transformer';

export class UpdateRestaurantDTO {
	@IsNotEmpty()
	@IsString()
	@MaxLength(30)
	@TrimString()
	name?: string;

	@IsUrl()
	@TrimString()
	picture?: string;

	@ArrayMaxSize(10)
	@ArrayNotEmpty()
	@IsArray()
	@IsString({ each: true })
	@MaxLength(15, { each: true })
	@Transform(({ value }) =>
		Array.isArray(value)
			? value.map((tag: string) => tag.trim().toLowerCase())
			: value,
	)
	tags?: string[];
}
