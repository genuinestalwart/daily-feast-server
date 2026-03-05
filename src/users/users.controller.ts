import {
	Controller,
	Get,
	Patch,
	Delete,
	Body,
	BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RequireAuth } from 'src/common/decorators/require-auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/auth-user.type';
import { UpdateUserBody } from './dto/update-user-body.dto';
import { ROLES } from 'src/common/constants/roles';
import {
	ApiDeleteUserResponses,
	ApiGetUserResponses,
	ApiUpdateUserResponses,
} from 'src/common/decorators/api/user.decorator';

@RequireAuth()
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiGetUserResponses()
	@Get('me')
	async getUser(@CurrentUser() currentUser: AuthUser) {
		return this.usersService.getUser(currentUser);
	}

	@ApiUpdateUserResponses()
	@Patch('me')
	async updateUser(
		@CurrentUser() currentUser: AuthUser,
		@Body() dto: UpdateUserBody,
	) {
		// check if at least one required field of any role is present or not
		const requiredFieldsByRole = {
			[ROLES.CUSTOMER]: ['name', 'picture'],
			[ROLES.RIDER]: ['name', 'picture'],
			[ROLES.RESTAURANT]: ['name', 'picture', 'tags'],
		};

		const requiredFields = requiredFieldsByRole[currentUser.role];
		const hasAtLeastOne = requiredFields.some((field) => !!dto[field]);

		if (!hasAtLeastOne) {
			throw new BadRequestException();
		}

		return this.usersService.updateUser(currentUser, dto);
	}

	@ApiDeleteUserResponses() // will be updated in the future
	@Delete('me')
	async deleteUser(@CurrentUser() currentUser: AuthUser) {
		return this.usersService.deleteUser(currentUser);
	}
}
