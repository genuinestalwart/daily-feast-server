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
import { CheckRoles } from 'src/common/decorators/check-roles.decorator';
import { ROLES } from 'src/common/constants/roles';
import { GetMenuItemsQuery } from './dto/get-menu-items-query.dto';
import { UpdateMenuItemBody } from './dto/update-menu-item-body.dto';
import { UserID } from 'src/common/decorators/user-id.decorator';
import { GetRoles } from 'src/common/decorators/get-roles.decorator';
import {
	ApiCreateMenuItemResponses,
	ApiDeleteMenuItemResponses,
	ApiGetMenuItemByIDResponses,
	ApiGetMenuItemsResponses,
	ApiSubmitForApprovalResponses,
	ApiUpdateMenuItemResponses,
} from 'src/common/decorators/api/menu-item.decorator';

@Controller('menu')
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
	async getMenuItemByID(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.menuItemsService.getMenuItemByID(id);
	}

	@ApiUpdateMenuItemResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Patch(':id')
	async updateMenuItem(
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body() dto: UpdateMenuItemBody,
		@UserID() userID: string,
		@GetRoles() roles: string[],
	) {
		const user = { userID, isRestaurant: roles.includes(ROLES.RESTAURANT) };
		return this.menuItemsService.updateMenuItem(id, dto, user);
	}

	@ApiSubmitForApprovalResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Patch(':id/submit')
	async submitForApproval(
		@Param('id', new ParseUUIDPipe()) id: string,
		@UserID() userID: string,
		@GetRoles() roles: string[],
	) {
		const user = { userID, isRestaurant: roles.includes(ROLES.RESTAURANT) };
		return this.menuItemsService.submitForApproval(id, user);
	}

	@ApiDeleteMenuItemResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Delete(':id')
	@HttpCode(204)
	async deleteMenuItem(
		@Param('id', new ParseUUIDPipe()) id: string,
		@UserID() userID: string,
		@GetRoles() roles: string[],
	) {
		const user = { userID, isRestaurant: roles.includes(ROLES.RESTAURANT) };
		return this.menuItemsService.deleteMenuItem(id, user);
	}
}
