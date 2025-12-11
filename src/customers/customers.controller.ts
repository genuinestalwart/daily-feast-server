import {
	Controller,
	Body,
	Delete,
	Get,
	Patch,
	BadRequestException,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateCustomerBody } from './dto/update-customer-body.dto';
import { CheckRoles } from 'src/common/decorators/check-roles.decorator';
import { ROLES } from 'src/common/constants/roles';
import { UserID } from 'src/common/decorators/user-id.decorator';
import {
	ApiDeleteCustomerResponses,
	ApiGetCustomerResponses,
	ApiUpdateCustomerResponses,
} from 'src/common/decorators/api/customer.decorator';

@CheckRoles(ROLES.CUSTOMER)
@Controller('customers')
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	@ApiGetCustomerResponses()
	@Get('me')
	async getCustomer(@UserID() userID: string) {
		return this.customersService.getCustomer(userID);
	}

	@ApiUpdateCustomerResponses()
	@Patch('me')
	async updateCustomer(
		@Body() dto: UpdateCustomerBody,
		@UserID() userID: string,
	) {
		if (!dto.name && !dto.picture) {
			throw new BadRequestException();
		}

		return this.customersService.updateCustomer(userID, dto);
	}

	@ApiDeleteCustomerResponses() // will be updated in the future
	@Delete('me')
	async deleteCustomer(@UserID() userID: string) {
		return this.customersService.deleteCustomer(userID);
	}
}
