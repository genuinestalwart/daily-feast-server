import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetRoles = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();

		return request.auth?.payload[
			`${process.env.AUTH0_IDENTIFIER}/roles`
		] as string[];
	},
);
