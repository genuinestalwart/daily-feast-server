import { Body, Controller, Get, Post } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';

@Controller('restaurants')
export class RestaurantsController {
	constructor(private readonly restaurantsService: RestaurantsService) {}

	@Post()
	create(@Body() createRestaurantDTO: CreateRestaurantDTO) {
		return this.restaurantsService.createRestaurant({
			...createRestaurantDTO,
			role: 'RESTAURANT',
		});
	}
}
