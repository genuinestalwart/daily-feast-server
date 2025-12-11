import { applyDecorators } from '@nestjs/common';
import {
	ApiConflictResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
} from '@nestjs/swagger';
import { ApiUserResponses } from './user.decorator';
import { CustomerResponse } from 'src/customers/dto/customer-response.dto';

export const ApiGetCustomerResponses = () => {
	return applyDecorators(
		ApiNotFoundResponse({ description: 'customer not found' }),
		ApiOkResponse({ type: CustomerResponse }),
		ApiUserResponses(),
	);
};

export const ApiUpdateCustomerResponses = ApiGetCustomerResponses;

export const ApiDeleteCustomerResponses = () => {
	return applyDecorators(
		ApiConflictResponse({ description: 'active orders ongoing' }),
		ApiNotFoundResponse({ description: 'customer not found' }),
		ApiOkResponse({
			example: {
				cancelledOrders: 1,
				grandTotalPrice: 100,
				failedOrders: 1,
				successfulOrders: 1,
				totalOrders: 3,
			},
		}),
		ApiUserResponses(),
	);
};
