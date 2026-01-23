import { applyDecorators } from '@nestjs/common';
import {
	ApiConflictResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiResponse,
} from '@nestjs/swagger';
import {
	MyRestaurantResponse,
	RestaurantResponse,
} from 'src/restaurants/dto/restaurant-response.dto';
import { ApiUserResponses } from './user.decorator';

export const ApiCreateRestaurantResponses = () => {
	return applyDecorators(
		ApiNotFoundResponse({ description: 'restaurant not found' }),
		ApiResponse({ status: 201, type: MyRestaurantResponse }),
		ApiUserResponses(),
	);
};

export const ApiGetRestaurantsResponses = () => {
	return applyDecorators(
		ApiOkResponse({ type: [RestaurantResponse] }),
		ApiUserResponses(),
	);
};

export const ApiGetMyRestaurantResponses = () => {
	return applyDecorators(
		ApiNotFoundResponse({ description: 'restaurant not found' }),
		ApiOkResponse({ type: MyRestaurantResponse }),
		ApiUserResponses(),
	);
};

export const ApiGetRestaurantByIDResponses = () => {
	return applyDecorators(
		ApiNotFoundResponse({ description: 'restaurant not found' }),
		ApiOkResponse({ type: RestaurantResponse }),
		ApiUserResponses(),
	);
};

export const ApiUpdateRestaurantResponses = ApiGetMyRestaurantResponses;

export const ApiDeleteRestaurantResponses = () => {
	return applyDecorators(
		ApiConflictResponse({ description: 'active orders ongoing' }),
		ApiNotFoundResponse({ description: 'restaurant not found' }),
		ApiOkResponse({
			example: {
				grandTotalPrice: 100,
				failedOrders: 1,
				menuItems: 2,
				rejectedOrders: 1,
				successfulOrders: 1,
				totalOrders: 3,
			},
		}),
		ApiUserResponses(),
	);
};
