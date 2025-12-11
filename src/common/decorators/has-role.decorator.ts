import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const HasRole = createParamDecorator(
	(role: string, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();

		const userRoles = request.auth?.payload[
			`${process.env.AUTH0_IDENTIFIER}/roles`
		] as string[];

		return role && userRoles.includes(role);
	},
);
