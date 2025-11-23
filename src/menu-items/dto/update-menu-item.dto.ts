import {
	ArrayMaxSize,
	ArrayNotEmpty,
	IsArray,
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsPositive,
	IsString,
	IsUrl,
	MaxLength,
	Min,
} from 'class-validator';
import { TrimArray } from 'src/shared/decorators/trim-array.decorator';
import { TrimString } from 'src/shared/decorators/trim-string.decorator';

export class UpdateMenuItemDTO {
	@IsBoolean()
	available?: boolean;

	@IsNotEmpty()
	@IsString()
	@MaxLength(500)
	@TrimString()
	description?: string;

	@IsUrl()
	@TrimString()
	image?: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(50)
	@TrimString()
	name?: string;

	@IsInt()
	@Min(5)
	prep_time?: number;

	@IsNumber()
	@IsPositive()
	price?: number;

	@ArrayMaxSize(10)
	@ArrayNotEmpty()
	@IsArray()
	@IsString({ each: true })
	@MaxLength(15, { each: true })
	@TrimArray()
	tags?: string[];
}
