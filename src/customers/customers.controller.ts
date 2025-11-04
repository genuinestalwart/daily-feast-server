import {
	Controller,
	Body,
	Delete,
	Get,
	Param,
	Patch,
	UseGuards,
	BadRequestException,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateCustomerDTO } from './dto/update-customer.dto';
import { RolesGuard } from 'src/shared/guards/roles.guard';

@Controller('customers')
@UseGuards(RolesGuard)
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	@Get(':id')
	getCustomer(@Param('id') id: string) {
		return this.customersService.getCustomer(id);
	}

	@Patch(':id')
	updateCustomer(
		@Param('id') id: string,
		@Body() updateCustomerDTO: UpdateCustomerDTO,
	) {
		if (!updateCustomerDTO.name && !updateCustomerDTO.picture) {
			throw new BadRequestException();
		}

		return this.customersService.updateCustomer(id, updateCustomerDTO);
	}

	@Delete(':id')
	async deleteCustomer(@Param('id') id: string) {
		return this.customersService.deleteCustomer(id);
	}
}
