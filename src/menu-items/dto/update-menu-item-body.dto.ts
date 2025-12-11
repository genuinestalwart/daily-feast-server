import { OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { CreateMenuItemBody } from './create-menu-item-body.dto';

export class UpdateMenuItemBody extends PartialType(
	OmitType(CreateMenuItemBody, ['category'] as const),
) {
	@IsBoolean()
	available?: boolean;
}
