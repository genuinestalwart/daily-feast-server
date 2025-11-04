import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ROLES } from '../constants/roles';

@Injectable()
export class RolesGuard implements CanActivate {
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();

		if (!request.user) {
			throw new UnauthorizedException();
		}

		const roles = request.user['https://daily-feast.com/roles'];

		if (!roles || !roles.length || !roles.includes(ROLES['CUSTOMER'])) {
			throw new ForbiddenException();
		}

		return true;
	}
}
