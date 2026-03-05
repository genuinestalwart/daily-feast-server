import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiExtraModels,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
	getSchemaPath,
} from '@nestjs/swagger';
import {
	MyCustomerResponse,
	DeleteCustomerResponse,
	DeleteRestaurantResponse,
	DeleteRiderResponse,
	MyRestaurantResponse,
	MyRiderResponse,
} from 'src/users/dto/user-response.dto';

export const ApiUserResponses = () => {
	return applyDecorators(
		ApiBadRequestResponse({ description: 'invalid request' }),
		ApiNotFoundResponse({ description: 'user not found' }),
		ApiUnauthorizedResponse({ description: 'invalid token' }),
	);
};

export const ApiGetUserResponses = () => {
	return applyDecorators(
		ApiExtraModels(
			MyCustomerResponse,
			MyRestaurantResponse,
			MyRiderResponse,
		),
		ApiOkResponse({
			schema: {
				oneOf: [
					{ $ref: getSchemaPath(MyCustomerResponse) },
					{ $ref: getSchemaPath(MyRestaurantResponse) },
					{ $ref: getSchemaPath(MyRiderResponse) },
				],
			},
		}),
		ApiUserResponses(),
	);
};

export const ApiUpdateUserResponses = ApiGetUserResponses;

export const ApiDeleteUserResponses = () => {
	return applyDecorators(
		ApiConflictResponse({ description: 'active orders ongoing' }),
		ApiExtraModels(
			DeleteCustomerResponse,
			DeleteRestaurantResponse,
			DeleteRiderResponse,
		),
		ApiOkResponse({
			schema: {
				oneOf: [
					{ $ref: getSchemaPath(DeleteCustomerResponse) },
					{ $ref: getSchemaPath(DeleteRestaurantResponse) },
					{ $ref: getSchemaPath(DeleteRiderResponse) },
				],
			},
		}),
		ApiUserResponses(),
	);
};
