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
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { ROLES } from 'src/common/constants/roles';
import { GetOrdersQuery } from './dto/get-orders-query.dto';
import { UpdateStatusBody } from './dto/update-status-body.dto';
import {
	ApiCreateOrderResponses,
	ApiGetOrderByIdResponses,
	ApiGetOrdersResponses,
	ApiUpdateStatusResponses,
} from 'src/common/decorators/api/order.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/auth-user.type';

@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@ApiCreateOrderResponses()
	@HasRoles(ROLES.CUSTOMER)
	@Post()
	async createOrder(
		@CurrentUser() currentUser: AuthUser,
		@Body() dto: CreateOrderBody,
	) {
		return this.ordersService.createOrder(currentUser.id, dto);
	}

	@ApiGetOrderByIdResponses()
	@HasRoles(ROLES.CUSTOMER, ROLES.RESTAURANT, ROLES.RIDER)
	@Get(':id')
	async getOrderById(
		@CurrentUser() currentUser: AuthUser,
		@Param('id', new ParseUUIDPipe()) id: string,
	) {
		return this.ordersService.getOrderById(currentUser, id);
	}

	@ApiGetOrdersResponses()
	@HasRoles(ROLES.CUSTOMER, ROLES.RESTAURANT, ROLES.RIDER)
	@Get()
	async getOrders(
		@CurrentUser() currentUser: AuthUser,
		@Body() dto: GetOrdersQuery,
	) {
		return this.ordersService.getOrders(currentUser, dto);
	}

	@ApiUpdateStatusResponses()
	@HasRoles(ROLES.CUSTOMER, ROLES.RESTAURANT, ROLES.RIDER)
	@Patch(':id')
	async updateStatus(
		@CurrentUser() currentUser: AuthUser,
		@Body() dto: UpdateStatusBody,
		@Param('id', new ParseUUIDPipe()) id: string,
	) {
		return this.ordersService.updateStatus(currentUser, dto, id);
	}
}
