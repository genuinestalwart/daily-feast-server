import {
	Controller,
	Body,
	Delete,
	Get,
	Param,
	Patch,
	BadRequestException,
	Req,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateCustomerDTO } from './dto/update-customer.dto';
import { CheckRoles } from 'src/shared/decorators/check-roles.decorator';
import { ROLES } from 'src/shared/constants/roles';
import type { Request } from 'express';
import { ensureOwnership } from 'src/shared/utils/ensureOwnership';

@Controller('customers')
@CheckRoles(ROLES.CUSTOMER)
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	@Get(':id')
	getCustomer(@Param('id') id: string) {
		return this.customersService.getCustomer(id);
	}

	@Patch(':id')
	updateCustomer(
		@Param('id') id: string,
		@Body() dto: UpdateCustomerDTO,
		@Req() request: Request,
	) {
		ensureOwnership(request, ROLES.CUSTOMER, id);

		if (!dto.name && !dto.picture) {
			throw new BadRequestException();
		}

		return this.customersService.updateCustomer(id, dto);
	}

	@Delete(':id')
	deleteCustomer(@Param('id') id: string, @Req() request: Request) {
		ensureOwnership(request, ROLES.CUSTOMER, id);
		return this.customersService.deleteCustomer(id);
	}
}
