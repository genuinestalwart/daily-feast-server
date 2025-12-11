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
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemBody } from './dto/create-menu-item-body.dto';
import { CheckRoles } from 'src/common/decorators/check-roles.decorator';
import { ROLES } from 'src/common/constants/roles';
import { GetMenuItemsQuery } from './dto/get-menu-items-query.dto';
import { UpdateMenuItemBody } from './dto/update-menu-item-body.dto';
import { UserID } from 'src/common/decorators/user-id.decorator';
import { HasRole } from 'src/common/decorators/has-role.decorator';
import {
	ApiCreateMenuItemResponses,
	ApiDeleteMenuItemResponses,
	ApiGetMenuItemByIDResponses,
	ApiGetMenuItemsResponses,
	ApiSubmitMenuItemResponses,
	ApiUpdateMenuItemResponses,
} from 'src/common/decorators/api/menu-item.decorator';

@Controller('menu-items')
export class MenuItemsController {
	constructor(private readonly menuItemsService: MenuItemsService) {}

	@ApiCreateMenuItemResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Post()
	async createMenuItem(
		@Body() dto: CreateMenuItemBody,
		@UserID() userID: string,
	) {
		return this.menuItemsService.createMenuItem(userID, dto);
	}

	@ApiGetMenuItemsResponses()
	@Get()
	async getMenuItems(@Query() query: GetMenuItemsQuery) {
		return this.menuItemsService.getMenuItems(query);
	}

	@ApiGetMenuItemByIDResponses()
	@Get(':id')
	async getMenuItemByID(@Param('id') id: string) {
		return this.menuItemsService.getMenuItemByID(id);
	}

	@ApiUpdateMenuItemResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Patch(':id')
	async updateMenuItem(
		@Param('id') id: string,
		@Body() dto: UpdateMenuItemBody,
		@UserID() userID: string,
		@HasRole(ROLES.RESTAURANT) hasRole: boolean,
	) {
		const user = { userID, hasRole };
		return this.menuItemsService.updateMenuItem(id, dto, user);
	}

	@ApiSubmitMenuItemResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Patch(':id/submit')
	async submitMenuItem(
		@Param('id') id: string,
		@UserID() userID: string,
		@HasRole(ROLES.RESTAURANT) hasRole: boolean,
	) {
		const user = { userID, hasRole };
		return this.menuItemsService.submitMenuItem(id, user);
	}

	@ApiDeleteMenuItemResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Delete(':id')
	@HttpCode(204)
	async deleteMenuItem(
		@Param('id') id: string,
		@UserID() userID: string,
		@HasRole(ROLES.RESTAURANT) hasRole: boolean,
	) {
		const user = { userID, hasRole };
		return this.menuItemsService.deleteMenuItem(id, user);
	}
}
