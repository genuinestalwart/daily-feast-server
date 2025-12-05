import {
	Controller,
	Get,
	Body,
	Patch,
	Delete,
	Req,
	BadRequestException,
} from '@nestjs/common';
import { RidersService } from './riders.service';
import { UpdateRiderDTO } from './dto/update-rider.dto';
import { CheckRoles } from 'src/shared/decorators/check-roles.decorator';
import { ROLES } from 'src/shared/constants/roles';
import type { Request } from 'express';

@Controller('riders')
@CheckRoles(ROLES.RIDER)
export class RidersController {
	constructor(private readonly ridersService: RidersService) {}

	@Get('me')
	getRider(@Req() request: Request) {
		const userID = request.auth?.payload.sub as string;
		return this.ridersService.getRider(userID);
	}

	@Patch('me')
	updateRider(@Body() dto: UpdateRiderDTO, @Req() request: Request) {
		if (!dto.name && !dto.picture) {
			throw new BadRequestException();
		}

		const userID = request.auth?.payload.sub as string;
		return this.ridersService.updateRider(userID, dto);
	}

	@Delete('me')
	deleteRider(@Req() request: Request) {
		const userID = request.auth?.payload.sub as string;
		return this.ridersService.deleteRider(userID);
	}
}
