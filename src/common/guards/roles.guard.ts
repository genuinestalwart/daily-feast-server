import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			'roles',
			[context.getHandler(), context.getClass()],
		);

		// If no roles are specified on @CheckRoles(), allow any authenticated user
		if (!requiredRoles.length) {
			return true;
		}

		const request: Request = context.switchToHttp().getRequest();

		if (!request.auth) {
			throw new UnauthorizedException();
		}

		const userRoles = request.auth?.payload[
			`${process.env.AUTH0_IDENTIFIER}/roles`
		] as string[];

		if (
			!userRoles.length ||
			!requiredRoles.some((role) => userRoles.includes(role))
		) {
			throw new ForbiddenException();
		}

		return true;
	}
}
