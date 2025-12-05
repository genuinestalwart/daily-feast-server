import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { ROLES } from 'src/shared/constants/roles';
import { CheckRoles } from 'src/shared/decorators/check-roles.decorator';
import type { Request } from 'express';
import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';
import { GetMyMenuItemsDTO } from '../menu-items/dto/get-my-menu-items.dto';
import { MenuItemsService } from 'src/menu-items/menu-items.service';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';
import { GetRestaurantsDTO } from './dto/get-restaurants.dto';

@Controller('restaurants')
export class RestaurantsController {
	constructor(
		private readonly restaurantsService: RestaurantsService,
		private readonly menuItemsService: MenuItemsService,
	) {}

	@Post()
	@CheckRoles(ROLES.RESTAURANT)
	createRestaurant(
		@Body() dto: CreateRestaurantDTO,
		@Req() request: Request,
	) {
		const userID = request.auth?.payload.sub as string;
		return this.restaurantsService.createRestaurant(userID, dto.name);
	}

	@Get()
	getRestaurants(@Query() query: GetRestaurantsDTO) {
		return this.restaurantsService.getRestaurants(query);
	}

	@Get('me')
	@CheckRoles(ROLES.RESTAURANT)
	getMyRestaurant(@Req() request: Request) {
		const userID = request.auth?.payload.sub as string;
		return this.restaurantsService.getMyRestaurant(userID);
	}

	@Get(':id')
	getRestaurantByID(@Param('id') id: string) {
		return this.restaurantsService.getRestaurantByID(id);
	}

	@Patch('me')
	@CheckRoles(ROLES.RESTAURANT)
	updateRestaurant(
		@Body() dto: UpdateRestaurantDTO,
		@Req() request: Request,
	) {
		if (!dto.name && !dto.picture && !dto.tags) {
			throw new BadRequestException();
		}

		const userID = request.auth?.payload.sub as string;
		return this.restaurantsService.updateRestaurant(userID, dto);
	}

	@Delete('me')
	@CheckRoles(ROLES.RESTAURANT)
	deleteRestaurant(@Req() request: Request) {
		const userID = request.auth?.payload.sub as string;
		return this.restaurantsService.deleteRestaurant(userID);
	}

	@Get('me/menu-items')
	@CheckRoles(ROLES.RESTAURANT)
	getMyMenuItems(@Query() query: GetMyMenuItemsDTO, @Req() request: Request) {
		const userID = request.auth?.payload.sub as string;
		return this.menuItemsService.getMyMenuItems(userID, query);
	}

	@Get('me/menu-items/:id')
	@CheckRoles(ROLES.RESTAURANT)
	getMyMenuItemByID(@Param('id') id: string, @Req() request: Request) {
		const userID = request.auth?.payload.sub as string;
		return this.menuItemsService.getMyMenuItemByID(userID, id);
	}
}
