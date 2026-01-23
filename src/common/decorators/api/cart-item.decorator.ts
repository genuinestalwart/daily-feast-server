import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiResponse,
} from '@nestjs/swagger';
import {
	CartItemResponse,
	UpdateAmountResponse,
} from 'src/cart-items/dto/cart-item-response.dto';

const ApiCommonResponses = () => {
	return applyDecorators(
		ApiBadRequestResponse({ description: 'invalid request' }),
		ApiForbiddenResponse({ description: 'not owned by this customer' }),
		ApiNotFoundResponse({ description: 'cart-item not found' }),
	);
};

export const ApiAddToCartResponses = () => {
	return applyDecorators(
		ApiConflictResponse({ description: 'menu-item not available' }),
		ApiResponse({ status: 201, type: CartItemResponse }),
	);
};

export const ApiGetCartItemsResponses = () =>
	ApiOkResponse({ type: [CartItemResponse] });

export const ApiUpdateAmountResponses = () => {
	return applyDecorators(
		ApiBadRequestResponse({ description: 'invalid request' }),
		ApiCommonResponses(),
		ApiOkResponse({ type: UpdateAmountResponse }),
	);
};

export const ApiRemoveFromCartResponses = () => {
	return applyDecorators(
		ApiCommonResponses(),
		ApiResponse({ status: 204, description: 'deleted successfully' }),
	);
};

export const ApiClearCartResponses = () =>
	ApiResponse({ status: 204, description: 'deleted successfully' });
