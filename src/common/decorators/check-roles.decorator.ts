import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';

export const CheckRoles = (...roles: string[]) => {
	return applyDecorators(
		ApiBearerAuth(),
		SetMetadata('roles', roles),
		UseGuards(AuthGuard, RolesGuard),
	);
};
