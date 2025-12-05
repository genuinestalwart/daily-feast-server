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
import { GetMenuItemsDTO } from './dto/get-menu-items.dto';
import { UpdateMenuItemDTO } from './dto/update-menu-item.dto';

@Controller('menu-items')
export class MenuItemsController {
	constructor(private readonly menuItemsService: MenuItemsService) {}

	@Post()
	@CheckRoles(ROLES.RESTAURANT)
	createMenuItem(@Body() dto: CreateMenuItemDTO, @Req() request: Request) {
		const userID = request.auth?.payload.sub as string;
		return this.menuItemsService.createMenuItem(userID, dto);
	}

	@Get()
	getMenuItems(@Query() query: GetMenuItemsDTO) {
		return this.menuItemsService.getMenuItems(query);
	}

	@Get(':id')
	getMenuItemByID(@Param('id') id: string) {
		return this.menuItemsService.getMenuItemByID(id);
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
