import {
	Controller,
	Get,
	Body,
	Patch,
	Delete,
	BadRequestException,
} from '@nestjs/common';
import { RidersService } from './riders.service';
import { UpdateRiderBody } from './dto/update-rider-body.dto';
import { CheckRoles } from 'src/common/decorators/check-roles.decorator';
import { ROLES } from 'src/common/constants/roles';
import { UserID } from 'src/common/decorators/user-id.decorator';
import {
	ApiDeleteRiderResponses,
	ApiGetRiderResponses,
	ApiUpdateRiderResponses,
} from 'src/common/decorators/api/rider.decorator';

@CheckRoles(ROLES.RIDER)
@Controller('riders')
export class RidersController {
	constructor(private readonly ridersService: RidersService) {}

	@ApiGetRiderResponses()
	@Get('me')
	async getRider(@UserID() userID: string) {
		return this.ridersService.getRider(userID);
	}

	@ApiUpdateRiderResponses()
	@Patch('me')
	async updateRider(@Body() dto: UpdateRiderBody, @UserID() userID: string) {
		if (!dto.name && !dto.picture) {
			throw new BadRequestException();
		}

		return this.ridersService.updateRider(userID, dto);
	}

	@ApiDeleteRiderResponses() // will be updated in the future
	@Delete('me')
	async deleteRider(@UserID() userID: string) {
		return this.ridersService.deleteRider(userID);
	}
}
