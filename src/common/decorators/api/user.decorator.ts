import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiForbiddenResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const ApiUserResponses = () => {
	return applyDecorators(
		ApiBadRequestResponse({ description: 'invalid request' }),
		ApiForbiddenResponse({ description: 'not enough permissions' }),
		ApiUnauthorizedResponse({ description: 'invalid token' }),
	);
};
