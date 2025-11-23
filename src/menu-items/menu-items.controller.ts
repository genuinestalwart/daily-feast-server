import {
	Controller,
	Post,
	Body,
	Delete,
	Param,
	Req,
	Get,
	Query,
	Patch,
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDTO } from './dto/create-menu-item.dto';
import { CheckRoles } from 'src/shared/decorators/check-roles.decorator';
import { ROLES } from 'src/shared/constants/roles';
import type { Request } from 'express';
import { GetManyMenuItemsDTO } from './dto/get-many-menu-items.dto';
import { UpdateMenuItemDTO } from './dto/update-menu-item.dto';

@Controller('menu-items')
export class MenuItemsController {
	constructor(private readonly menuItemsService: MenuItemsService) {}

	@Post()
	@CheckRoles(ROLES.RESTAURANT)
	createMenuItem(@Body() dto: CreateMenuItemDTO) {
		return this.menuItemsService.createMenuItem(dto);
	}

	@Get(':id')
	getMenuItem(@Param('id') id: string) {
		return this.menuItemsService.getMenuItem(id);
	}

	@Get()
	getManyMenuItems(@Query() query: GetManyMenuItemsDTO) {
		return this.menuItemsService.getManyMenuItems(query);
	}

	@Patch(':id')
	@CheckRoles(ROLES.RESTAURANT)
	updateMenuItem(
		@Param('id') id: string,
		@Body() dto: UpdateMenuItemDTO,
		@Req() request: Request,
	) {
		return this.menuItemsService.updateMenuItem(id, dto, request);
	}

	@Patch(':id/submit')
	@CheckRoles(ROLES.RESTAURANT)
	submitMenuItem(@Param('id') id: string, @Req() request: Request) {
		return this.menuItemsService.submitMenuItem(id, request);
	}

	@Delete(':id')
	@CheckRoles(ROLES.RESTAURANT)
	deleteMenuItem(@Param('id') id: string, @Req() request: Request) {
		return this.menuItemsService.deleteMenuItem(id, request);
	}
}
