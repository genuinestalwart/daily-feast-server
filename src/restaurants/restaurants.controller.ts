import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Req,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { ROLES } from 'src/shared/constants/roles';
import { CheckRoles } from 'src/shared/decorators/check-roles.decorator';
import type { Request } from 'express';
import { ensureAccountOwnership } from 'src/shared/utils/ensureAccountOwnership';
import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';

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
		@Body() updateRestaurantDTO: UpdateRestaurantDTO,
		@Req() request: Request,
	) {
		ensureAccountOwnership(request, ROLES.RESTAURANT, id);

		if (!updateRestaurantDTO.name && !updateRestaurantDTO.picture) {
			throw new BadRequestException();
		}

		return this.restaurantsService.updateRestaurant(
			id,
			updateRestaurantDTO,
		);
	}

	@Delete(':id')
	deleteRestaurant(@Param('id') id: string, @Req() request: Request) {
		ensureAccountOwnership(request, ROLES.RESTAURANT, id);
		return this.restaurantsService.deleteRestaurant(id);
	}
}
