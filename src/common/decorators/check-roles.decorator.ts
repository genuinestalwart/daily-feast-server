import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export const CheckRoles = (...roles: string[]) => {
	return applyDecorators(
		ApiBearerAuth(),
		SetMetadata('roles', roles),
		UseGuards(RolesGuard),
	);
};
