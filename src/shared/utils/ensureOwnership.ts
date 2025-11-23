import { ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';

export const ensureOwnership = (request: Request, role: string, id: string) => {
	const userID = request.auth?.payload.sub as string;

	const userRoles = request.auth?.payload[
		`${process.env.AUTH0_IDENTIFIER}/roles`
	] as string[];

	if (userRoles.includes(role) && userID !== id) {
		throw new ForbiddenException();
	}
};
