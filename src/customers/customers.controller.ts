import {
	Controller,
	Body,
	Delete,
	Get,
	Patch,
	BadRequestException,
	Req,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateCustomerDTO } from './dto/update-customer.dto';
import { CheckRoles } from 'src/shared/decorators/check-roles.decorator';
import { ROLES } from 'src/shared/constants/roles';
import type { Request } from 'express';

@Controller('customers')
@CheckRoles(ROLES.CUSTOMER)
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	@Get('me')
	getCustomer(@Req() request: Request) {
		const userID = request.auth?.payload.sub as string;
		return this.customersService.getCustomer(userID);
	}

	@Patch('me')
	updateCustomer(@Body() dto: UpdateCustomerDTO, @Req() request: Request) {
		if (!dto.name && !dto.picture) {
			throw new BadRequestException();
		}

		const userID = request.auth?.payload.sub as string;
		return this.customersService.updateCustomer(userID, dto);
	}

	@Delete('me')
	deleteCustomer(@Req() request: Request) {
		const userID = request.auth?.payload.sub as string;
		return this.customersService.deleteCustomer(userID);
	}
}
