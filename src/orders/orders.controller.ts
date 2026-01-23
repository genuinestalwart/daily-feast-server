import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderBody } from './dto/create-order-body.dto';
import { CheckRoles } from 'src/common/decorators/check-roles.decorator';
import { ROLES } from 'src/common/constants/roles';
import { UserID } from 'src/common/decorators/user-id.decorator';
import { GetOrdersQuery } from './dto/get-orders-query.dto';
import { GetRoles } from 'src/common/decorators/get-roles.decorator';
import { UpdateStatusBody } from './dto/update-status-body.dto';
import {
	ApiCreateOrderResponses,
	ApiGetOrderByIDResponses,
	ApiGetOrdersResponses,
	ApiUpdateStatusResponses,
} from 'src/common/decorators/api/order.decorator';

@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@ApiCreateOrderResponses()
	@CheckRoles(ROLES.CUSTOMER)
	@Post()
	async createOrder(@Body() dto: CreateOrderBody, @UserID() userID: string) {
		return this.ordersService.createOrder(userID, dto);
	}

	@ApiGetOrderByIDResponses()
	@CheckRoles(ROLES.CUSTOMER, ROLES.RESTAURANT, ROLES.RIDER)
	@Get(':id')
	async getOrderByID(
		@Param('id', new ParseUUIDPipe()) id: string,
		@UserID() userID: string,
		@GetRoles() roles: string[],
	) {
		return this.ordersService.getOrderByID(id, userID, roles);
	}

	@ApiGetOrdersResponses()
	@CheckRoles(ROLES.CUSTOMER, ROLES.RESTAURANT, ROLES.RIDER)
	@Get()
	async getOrders(
		@Body() dto: GetOrdersQuery,
		@UserID() userID: string,
		@GetRoles() roles: string[],
	) {
		return this.ordersService.getOrders(dto, userID, roles);
	}

	@ApiUpdateStatusResponses()
	@CheckRoles(ROLES.CUSTOMER, ROLES.RESTAURANT, ROLES.RIDER)
	@Patch(':id')
	async updateStatus(
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body() dto: UpdateStatusBody,
		@UserID() userID: string,
		@GetRoles() roles: string[],
	) {
		return this.ordersService.updateStatus(id, dto, userID, roles);
	}
}
