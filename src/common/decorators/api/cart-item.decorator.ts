import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiResponse,
} from '@nestjs/swagger';
import {
	CartItemResponse,
	UpdateAmountResponse,
} from 'src/cart-items/dto/cart-item-response.dto';

const ApiCartItemResponses = () => {
	return applyDecorators(
		ApiForbiddenResponse({ description: 'not owned by this customer' }),
		ApiNotFoundResponse({ description: 'cart-item not found' }),
	);
};

export const ApiAddToCartResponses = () =>
	ApiResponse({ status: 201, type: CartItemResponse });

export const ApiGetCartItemsResponses = () =>
	ApiOkResponse({ type: [CartItemResponse] });

export const ApiUpdateCartItemResponses = () => {
	return applyDecorators(
		ApiBadRequestResponse({ description: 'invalid request' }),
		ApiCartItemResponses(),
		ApiOkResponse({ type: UpdateAmountResponse }),
	);
};

export const ApiRemoveCartItemResponses = () => {
	return applyDecorators(
		ApiCartItemResponses(),
		ApiResponse({ status: 204, description: 'deleted successfully' }),
	);
};

export const ApiClearCartResponses = () =>
	ApiResponse({ status: 204, description: 'deleted successfully' });
