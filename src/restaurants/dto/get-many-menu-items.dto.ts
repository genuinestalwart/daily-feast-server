import { Transform, Type } from 'class-transformer';
import {
	ArrayMaxSize,
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsPositive,
	IsString,
	MaxLength,
} from 'class-validator';
import { Category, MenuItemStatus } from 'prisma/generated/enums';

export class GetManyMenuItemsDTO {
	@IsBoolean()
	@IsOptional()
	@Transform(({ value }) =>
		value === 'true' ? true : value === 'false' ? false : undefined,
	)
	available?: boolean;

	@IsEnum(Category)
	@IsOptional()
	category?: 'DISH' | 'DRINK';

	@IsOptional()
	@IsString()
	name?: string;

	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	skip?: number;

	@IsEnum(MenuItemStatus)
	@IsOptional()
	status?: 'APPROVED' | 'KEPT_AS_DRAFT' | 'PENDING_APPROVAL' | 'DENIED';

	@ArrayMaxSize(10)
	@IsArray()
	@IsOptional({ each: true })
	@IsString({ each: true })
	@MaxLength(15, { each: true })
	@Transform(({ value }) =>
		typeof value === 'string' ? value.toLowerCase().split(',') : value,
	)
	tags?: string[];

	@IsInt()
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	take?: number;
}
