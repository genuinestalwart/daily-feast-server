import { Controller } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { ROLES } from 'src/common/constants/roles';

@HasRoles(ROLES.CUSTOMER)
@Controller('customers')
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}
}
