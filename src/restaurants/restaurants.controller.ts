import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Query,
	Req,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { ROLES } from 'src/shared/constants/roles';
import { CheckRoles } from 'src/shared/decorators/check-roles.decorator';
import type { Request } from 'express';
import { ensureOwnership } from 'src/shared/utils/ensureOwnership';
import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';
import { GetManyMenuItemsDTO } from './dto/get-many-menu-items.dto';

@Controller('restaurants')
@CheckRoles(ROLES.RESTAURANT)
export class RestaurantsController {
	constructor(private readonly restaurantsService: RestaurantsService) {}

	@Get(':id')
	getRestaurant(@Param('id') id: string) {
		return this.restaurantsService.getRestaurant(id);
	}

	@Patch(':id')
	updateRestaurant(
		@Param('id') id: string,
		@Body() dto: UpdateRestaurantDTO,
		@Req() request: Request,
	) {
		ensureOwnership(request, ROLES.RESTAURANT, id);

		if (!dto.name && !dto.picture) {
			throw new BadRequestException();
		}

		return this.restaurantsService.updateRestaurant(id, dto);
	}

	@Delete(':id')
	deleteRestaurant(@Param('id') id: string, @Req() request: Request) {
		ensureOwnership(request, ROLES.RESTAURANT, id);
		return this.restaurantsService.deleteRestaurant(id);
	}

	@Get(':restaurant_id/menu-items/:menu_item_id')
	getMenuItem(
		@Param('restaurant_id') restaurant_id: string,
		@Param('menu_item_id') menu_item_id: string,
	) {
		return this.restaurantsService.getMenuItem(restaurant_id, menu_item_id);
	}

	@Get(':id/menu-items')
	getManyMenuItems(
		@Param('id') id: string,
		@Query() query: GetManyMenuItemsDTO,
	) {
		return this.restaurantsService.getManyMenuItems(id, query);
	}
}
