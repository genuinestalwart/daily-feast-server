import {
	Controller,
	Post,
	Body,
	Delete,
	Param,
	Get,
	Query,
	Patch,
	HttpCode,
	ParseUUIDPipe,
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemBody } from './dto/create-menu-item-body.dto';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { ROLES } from 'src/common/constants/roles';
import { GetMenuItemsQuery } from './dto/menu-items-query.dto';
import { UpdateMenuItemBody } from './dto/update-menu-item-body.dto';
import {
	ApiCreateMenuItemResponses,
	ApiDeleteMenuItemResponses,
	ApiGetMenuItemByIdResponses,
	ApiGetMenuItemsResponses,
	ApiSubmitForApprovalResponses,
	ApiUpdateMenuItemResponses,
} from 'src/common/decorators/api/menu-item.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/auth-user.type';

@Controller('menu')
export class MenuItemsController {
	constructor(private readonly menuItemsService: MenuItemsService) {}

	@ApiCreateMenuItemResponses()
	@HasRoles(ROLES.RESTAURANT)
	@Post()
	async createMenuItem(
		@CurrentUser() currentUser: AuthUser,
		@Body() dto: CreateMenuItemBody,
	) {
		return this.menuItemsService.createMenuItem(currentUser.id, dto);
	}

	@ApiGetMenuItemsResponses()
	@Get()
	async getMenuItems(@Query() query: GetMenuItemsQuery) {
		return this.menuItemsService.getMenuItems(query);
	}

	@ApiGetMenuItemByIdResponses()
	@Get(':id')
	async getMenuItemById(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.menuItemsService.getMenuItemById(id);
	}

	@ApiUpdateMenuItemResponses()
	@HasRoles(ROLES.RESTAURANT)
	@Patch(':id')
	async updateMenuItem(
		@CurrentUser() currentUser: AuthUser,
		@Body() dto: UpdateMenuItemBody,
		@Param('id', new ParseUUIDPipe()) id: string,
	) {
		return this.menuItemsService.updateMenuItem(currentUser.id, dto, id);
	}

	@ApiSubmitForApprovalResponses()
	@HasRoles(ROLES.RESTAURANT)
	@Patch(':id/submit')
	async submitForApproval(
		@CurrentUser() currentUser: AuthUser,
		@Param('id', new ParseUUIDPipe()) id: string,
	) {
		return this.menuItemsService.submitForApproval(currentUser.id, id);
	}

	@ApiDeleteMenuItemResponses()
	@HasRoles(ROLES.RESTAURANT)
	@Delete(':id')
	@HttpCode(204)
	async deleteMenuItem(
		@CurrentUser() currentUser: AuthUser,
		@Param('id', new ParseUUIDPipe()) id: string,
	) {
		return this.menuItemsService.deleteMenuItem(currentUser.id, id);
	}
}
