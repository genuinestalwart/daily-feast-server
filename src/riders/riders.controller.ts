import {
	Controller,
	Get,
	Body,
	Patch,
	Param,
	Delete,
	Req,
	BadRequestException,
} from '@nestjs/common';
import { RidersService } from './riders.service';
import { UpdateRiderDTO } from './dto/update-rider.dto';
import { CheckRoles } from 'src/shared/decorators/check-roles.decorator';
import { ROLES } from 'src/shared/constants/roles';
import { ensureOwnership } from 'src/shared/utils/ensureOwnership';
import type { Request } from 'express';

@Controller('riders')
@CheckRoles(ROLES.RIDER)
export class RidersController {
	constructor(private readonly ridersService: RidersService) {}

	@Get(':id')
	getRider(@Param('id') id: string) {
		return this.ridersService.getRider(id);
	}

	@Patch(':id')
	updateRider(
		@Param('id') id: string,
		@Body() dto: UpdateRiderDTO,
		@Req() request: Request,
	) {
		ensureOwnership(request, ROLES.RIDER, id);

		if (!dto.name && !dto.picture) {
			throw new BadRequestException();
		}

		return this.ridersService.updateRider(id, dto);
	}

	@Delete(':id')
	deleteRider(@Param('id') id: string, @Req() request: Request) {
		ensureOwnership(request, ROLES.RIDER, id);
		return this.ridersService.deleteRider(id);
	}
}
