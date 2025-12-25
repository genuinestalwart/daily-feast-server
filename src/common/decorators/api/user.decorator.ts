import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const ApiUserResponses = () => {
	return applyDecorators(
		ApiBadRequestResponse({ description: 'invalid request' }),
		ApiUnauthorizedResponse({ description: 'invalid token' }),
	);
};
