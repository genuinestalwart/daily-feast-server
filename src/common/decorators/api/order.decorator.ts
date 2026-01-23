import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiResponse,
} from '@nestjs/swagger';
import { OrderResponse } from 'src/orders/dto/order-response.dto';

const ApiCommonResponses = () => {
	return applyDecorators(
		ApiBadRequestResponse({ description: 'invalid request' }),
		ApiNotFoundResponse({ description: 'order not found' }),
	);
};

export const ApiCreateOrderResponses = () => {
	return applyDecorators(
		ApiBadRequestResponse({ description: 'cart-item missing' }),
		ApiResponse({ status: 201, type: [OrderResponse] }),
	);
};

export const ApiGetOrderByIDResponses = () => {
	return applyDecorators(
		ApiCommonResponses(),
		ApiOkResponse({ type: OrderResponse }),
	);
};

export const ApiGetOrdersResponses = () =>
	ApiOkResponse({ type: [OrderResponse] });

export const ApiUpdateStatusResponses = () => {
	return applyDecorators(
		ApiCommonResponses(),
		ApiConflictResponse({ description: 'incorrect status transition' }),
		ApiOkResponse({ type: OrderResponse }),
	);
};
