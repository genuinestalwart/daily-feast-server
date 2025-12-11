import { applyDecorators } from '@nestjs/common';
import {
	ApiConflictResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
} from '@nestjs/swagger';
import { ApiUserResponses } from './user.decorator';
import { RiderResponse } from 'src/riders/dto/rider-response.dto';

export const ApiGetRiderResponses = () => {
	return applyDecorators(
		ApiNotFoundResponse({ description: 'rider not found' }),
		ApiOkResponse({ type: RiderResponse }),
		ApiUserResponses(),
	);
};

export const ApiUpdateRiderResponses = ApiGetRiderResponses;

export const ApiDeleteRiderResponses = () => {
	return applyDecorators(
		ApiConflictResponse({ description: 'active orders ongoing' }),
		ApiNotFoundResponse({ description: 'rider not found' }),
		ApiOkResponse({
			example: { failedOrders: 1, successfulOrders: 1, totalOrders: 2 },
		}),
		ApiUserResponses(),
	);
};
