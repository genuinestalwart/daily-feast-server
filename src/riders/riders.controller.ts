import { Controller } from '@nestjs/common';
import { RidersService } from './riders.service';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { ROLES } from 'src/common/constants/roles';

@HasRoles(ROLES.RIDER)
@Controller('riders')
export class RidersController {
	constructor(private readonly ridersService: RidersService) {}
}
