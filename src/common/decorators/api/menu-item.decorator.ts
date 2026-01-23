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

export const ApiGetMenuItemByIDResponses = () => {
	return applyDecorators(
		ApiCommonResponses(),
		ApiOkResponse({ type: MenuItemResponse }),
	);
};

export const ApiUpdateMenuItemResponses = () => {
	return applyDecorators(
		ApiConflictResponse({ description: 'active orders ongoing' }),
		ApiForbiddenResponse({ description: 'not owned by this restaurant' }),
		ApiCommonResponses(),
		ApiOkResponse({ type: UpdateMenuItemResponse }),
	);
};

export const ApiSubmitForApprovalResponses = () => {
	return applyDecorators(
		ApiConflictResponse({
			description: 'status cannot be "KEPT_AS_DRAFT"',
		}),
		ApiForbiddenResponse({ description: 'not owned by this restaurant' }),
		ApiCommonResponses(),
		ApiOkResponse({ type: SubmitMenuItemResponse }),
	);
};

export const ApiDeleteMenuItemResponses = () => {
	return applyDecorators(
		ApiConflictResponse({ description: 'active orders ongoing' }),
		ApiForbiddenResponse({ description: 'not owned by this restaurant' }),
		ApiCommonResponses(),
		ApiResponse({ status: 204, description: 'deleted successfully' }),
	);
};

export const ApiGetMyMenuItemsResponses = () =>
	ApiOkResponse({ type: [MyMenuItemResponse] });

export const ApiGetMyMenuItemByIDResponses = () => {
	return applyDecorators(
		ApiCommonResponses(),
		ApiOkResponse({ type: MyMenuItemResponse }),
	);
};
