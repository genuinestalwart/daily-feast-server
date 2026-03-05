import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { ROLES } from 'src/common/constants/roles';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { GetMyMenuItemsQuery } from '../menu-items/dto/menu-items-query.dto';
import { MenuItemsService } from 'src/menu-items/menu-items.service';
import { GetRestaurantsQuery } from './dto/get-restaurants-query.dto';
import {
	ApiGetRestaurantByIdResponses,
	ApiGetRestaurantsResponses,
} from 'src/common/decorators/api/restaurant.decorator';
import {
	ApiGetMyMenuItemByIdResponses,
	ApiGetMyMenuItemsResponses,
} from 'src/common/decorators/api/menu-item.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/auth-user.type';

@Controller('restaurants')
export class RestaurantsController {
	constructor(
		private readonly restaurantsService: RestaurantsService,
		private readonly menuItemsService: MenuItemsService,
	) {}

	@ApiGetRestaurantsResponses()
	@Get()
	async getRestaurants(@Query() query: GetRestaurantsQuery) {
		return this.restaurantsService.getRestaurants(query);
	}

	@ApiGetRestaurantByIdResponses()
	@Get(':id')
	async getRestaurantById(@Param('id') id: string) {
		return this.restaurantsService.getRestaurantById(id);
	}

	@ApiGetMyMenuItemsResponses()
	@HasRoles(ROLES.RESTAURANT)
	@Get('me/menu')
	async getMyMenuItems(
		@CurrentUser() currentUser: AuthUser,
		@Query() query: GetMyMenuItemsQuery,
	) {
		return this.menuItemsService.getMyMenuItems(currentUser.id, query);
	}

	@ApiGetMyMenuItemByIdResponses()
	@HasRoles(ROLES.RESTAURANT)
	@Get('me/menu/:id')
	async getMyMenuItemById(
		@CurrentUser() currentUser: AuthUser,
		@Param('id', new ParseUUIDPipe()) id: string,
	) {
		return this.menuItemsService.getMyMenuItemById(currentUser.id, id);
	}
}
