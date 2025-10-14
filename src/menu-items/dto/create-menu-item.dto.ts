import { Category } from '@prisma/client';
import {
	ArrayMaxSize,
	ArrayNotEmpty,
	IsArray,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsPositive,
	IsString,
	IsUrl,
	IsUUID,
	MaxLength,
	Min,
} from 'class-validator';

export class CreateMenuItemDTO {
	@IsEnum(Category)
	category: 'DISH' | 'DRINK';

	@IsNotEmpty()
	@IsString()
	@MaxLength(500)
	description: string;

	@IsUrl()
	image: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(50)
	name: string;

	@IsInt()
	@Min(5)
	prep_time: number;

	@IsNumber()
	@IsPositive()
	price: number;

	@IsUUID()
	restaurant_id: string;

	@ArrayMaxSize(10)
	@ArrayNotEmpty()
	@IsArray()
	@IsString({ each: true })
	@MaxLength(15, { each: true })
	tags: string[];
}
