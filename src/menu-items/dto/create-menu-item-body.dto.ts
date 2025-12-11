import { Category } from 'prisma/generated/enums';
import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsPositive,
	IsString,
	IsUrl,
	MaxLength,
	Min,
} from 'class-validator';
import { TrimString } from 'src/common/decorators/trim-string.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuItemBody {
	@ApiProperty({ enum: Category })
	@IsEnum(Category)
	category: Category;

	@IsNotEmpty()
	@IsString()
	@MaxLength(500)
	@TrimString()
	description: string;

	@IsUrl()
	@TrimString()
	image: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(50)
	@TrimString()
	name: string;

	@IsInt()
	@Min(5)
	prep_time: number;

	@IsNumber()
	@IsPositive()
	price: number;
}
