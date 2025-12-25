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

		const request: Request = context.switchToHttp().getRequest();
		const payload = request.auth?.payload;

		if (!payload) {
			throw new UnauthorizedException();
		}

		const userRoles = payload[
			`${process.env.AUTH0_IDENTIFIER}/roles`
		] as string[];

		if (!userRoles || !userRoles.length) {
			throw new UnauthorizedException();
		}

		if (!requiredRoles.some((role) => userRoles.includes(role))) {
			throw new ForbiddenException();
		}

		return true;
	}
}
