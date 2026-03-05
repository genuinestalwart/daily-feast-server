import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { RestaurantResponse } from 'src/restaurants/dto/restaurant-response.dto';
import { ApiUserResponses } from './user.decorator';

export const ApiGetRestaurantsResponses = () => {
	return applyDecorators(
		ApiOkResponse({ type: [RestaurantResponse] }),
		ApiUserResponses(),
	);
};

export const ApiGetRestaurantByIdResponses = () => {
	return applyDecorators(
		ApiNotFoundResponse({ description: 'restaurant not found' }),
		ApiOkResponse({ type: RestaurantResponse }),
		ApiUserResponses(),
	);
};
