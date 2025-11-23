import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Auth0Service } from 'src/auth0/auth0.service';
import { UpdateCustomerDTO } from './dto/update-customer.dto';
import { ROLES } from 'src/shared/constants/roles';

@Injectable()
export class CustomersService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
	) {}

	async getCustomer(id: string) {
		const customer = await this.auth0Service.users.get(id);
		const { data } = await this.auth0Service.users.roles.list(id);

		// Not having the CUSTOMER role means the user doesn't exist as a customer
		if (!data.map((role) => role.name).includes(ROLES.CUSTOMER)) {
			throw new NotFoundException();
		}

		return {
			created_at: customer.created_at,
			email: customer.email,
			email_verified: customer.email_verified,
			id: customer.user_id,
			identities: customer.identities,
			name: customer.name,
			picture: customer.picture,
			role: 'CUSTOMER',
			updated_at: customer.updated_at,
		};
	}

	async updateCustomer(id: string, dto: UpdateCustomerDTO) {
		return this.auth0Service.users.update(id, dto);
	}

	async deleteCustomer(id: string) {
		// Customer can't be deleted if an order is still ongoing
		const activeOrders = await this.prismaService.order.count({
			where: {
				customer_id: id,
				status: {
					notIn: ['CANCELLED', 'DELIVERED', 'FAILED', 'REJECTED'],
				},
			},
		});

		if (activeOrders) {
			throw new ConflictException();
		}

		const orders = await this.prismaService.$transaction(async (tx) => {
			await tx.cartItem.deleteMany({ where: { customer_id: id } });

			const updated = await tx.order.updateManyAndReturn({
				data: { customer_id: null },
				select: { status: true, total_price: true },
				where: { customer_id: id },
			});

			return updated;
		});

		await this.auth0Service.users.delete(id);

		return {
			cancelledOrders: orders.filter(
				(order) => order.status === 'CANCELLED',
			).length,
			failedOrders: orders.filter((order) => order.status === 'FAILED')
				.length,
			grandTotalPrice: orders
				.filter((order) => order.status === 'DELIVERED')
				.reduce((sum, order) => sum + order.total_price, 0),
			successfulOrders: orders.filter(
				(order) => order.status === 'DELIVERED',
			).length,
			totalOrders: orders.length,
		};
	}
}
