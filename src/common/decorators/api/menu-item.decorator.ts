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
	CreateMenuItemResponse,
	MenuItemResponse,
	MyMenuItemResponse,
	SubmitMenuItemResponse,
	UpdateMenuItemResponse,
} from 'src/menu-items/dto/menu-item-response.dto';

const ApiCommonResponses = () => {
	return applyDecorators(
		ApiBadRequestResponse({ description: 'invalid request' }),
		ApiNotFoundResponse({ description: 'menu-item not found' }),
	);
};

export const ApiCreateMenuItemResponses = () =>
	ApiResponse({ status: 201, type: CreateMenuItemResponse });

export const ApiGetMenuItemsResponses = () =>
	ApiOkResponse({ type: [MenuItemResponse] });

export const ApiGetMenuItemByIdResponses = () => {
	return applyDecorators(
		ApiCommonResponses(),
		ApiOkResponse({ type: MenuItemResponse }),
	);
};

export const ApiUpdateMenuItemResponses = () => {
	return applyDecorators(
		ApiCommonResponses(),
		ApiConflictResponse({ description: 'active orders ongoing' }),
		ApiForbiddenResponse({ description: 'not owned by this restaurant' }),
		ApiOkResponse({ type: UpdateMenuItemResponse }),
	);
};

export const ApiSubmitForApprovalResponses = () => {
	return applyDecorators(
		ApiCommonResponses(),
		ApiConflictResponse({
			description: 'status cannot be "KEPT_AS_DRAFT"',
		}),
		ApiForbiddenResponse({ description: 'not owned by this restaurant' }),
		ApiOkResponse({ type: SubmitMenuItemResponse }),
	);
};

export const ApiDeleteMenuItemResponses = () => {
	return applyDecorators(
		ApiCommonResponses(),
		ApiConflictResponse({ description: 'active orders ongoing' }),
		ApiForbiddenResponse({ description: 'not owned by this restaurant' }),
		ApiResponse({ status: 204, description: 'deleted successfully' }),
	);
};

export const ApiGetMyMenuItemsResponses = () =>
	ApiOkResponse({ type: [MyMenuItemResponse] });

export const ApiGetMyMenuItemByIdResponses = () => {
	return applyDecorators(
		ApiCommonResponses(),
		ApiOkResponse({ type: MyMenuItemResponse }),
	);
};
