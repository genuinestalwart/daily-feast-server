import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { ROLES } from 'src/common/constants/roles';
import { CheckRoles } from 'src/common/decorators/check-roles.decorator';
import { UpdateRestaurantBody } from './dto/update-restaurant-body.dto';
import { GetMyMenuItemsQuery } from '../menu-items/dto/get-my-menu-items-query.dto';
import { MenuItemsService } from 'src/menu-items/menu-items.service';
import { GetRestaurantsQuery } from './dto/get-restaurants-query.dto';
import { UserID } from 'src/common/decorators/user-id.decorator';
import {
	ApiCreateRestaurantResponses,
	ApiDeleteRestaurantResponses,
	ApiGetMyRestaurantResponses,
	ApiGetRestaurantByIDResponses,
	ApiGetRestaurantsResponses,
	ApiUpdateRestaurantResponses,
} from 'src/common/decorators/api/restaurant.decorator';
import {
	ApiGetMyMenuItemByIDResponses,
	ApiGetMyMenuItemsResponses,
} from 'src/common/decorators/api/menu-item.decorator';

@Controller('restaurants')
export class RestaurantsController {
	constructor(
		private readonly restaurantsService: RestaurantsService,
		private readonly menuItemsService: MenuItemsService,
	) {}

	@ApiCreateRestaurantResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Post()
	async createRestaurant(@UserID() userID: string) {
		return this.restaurantsService.createRestaurant(userID);
	}

	@ApiGetRestaurantsResponses()
	@Get()
	async getRestaurants(@Query() query: GetRestaurantsQuery) {
		return this.restaurantsService.getRestaurants(query);
	}

	@ApiGetMyRestaurantResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Get('me')
	async getMyRestaurant(@UserID() userID: string) {
		return this.restaurantsService.getMyRestaurant(userID);
	}

	@ApiGetRestaurantByIDResponses()
	@Get(':id')
	async getRestaurantByID(@Param('id') id: string) {
		return this.restaurantsService.getRestaurantByID(id);
	}

	@ApiUpdateRestaurantResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Patch('me')
	async updateRestaurant(
		@Body() dto: UpdateRestaurantBody,
		@UserID() userID: string,
	) {
		if (!dto.name && !dto.picture && !dto.tags) {
			throw new BadRequestException();
		}

		return this.restaurantsService.updateRestaurant(userID, dto);
	}

	@ApiDeleteRestaurantResponses() // will be updated in the future
	@CheckRoles(ROLES.RESTAURANT)
	@Delete('me')
	async deleteRestaurant(@UserID() userID: string) {
		return this.restaurantsService.deleteRestaurant(userID);
	}

	@ApiGetMyMenuItemsResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Get('me/menu')
	async getMyMenuItems(
		@Query() query: GetMyMenuItemsQuery,
		@UserID() userID: string,
	) {
		return this.menuItemsService.getMyMenuItems(userID, query);
	}

	@ApiGetMyMenuItemByIDResponses()
	@CheckRoles(ROLES.RESTAURANT)
	@Get('me/menu/:id')
	async getMyMenuItemByID(
		@Param('id', new ParseUUIDPipe()) id: string,
		@UserID() userID: string,
	) {
		return this.menuItemsService.getMyMenuItemByID(userID, id);
	}
}
