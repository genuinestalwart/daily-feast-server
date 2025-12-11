import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Auth0Service } from 'src/auth0/auth0.service';
import { UpdateCustomerBody } from './dto/update-customer-body.dto';
import { ROLES } from 'src/common/constants/roles';
import { UsersService } from 'src/common/services/users.service';

@Injectable()
export class CustomersService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
		private readonly usersService: UsersService,
	) {}

	async getCustomer(id: string) {
		return this.usersService.getUser(id, ROLES.CUSTOMER);
	}

	async updateCustomer(id: string, dto: UpdateCustomerBody) {
		await this.auth0Service.users.update(id, dto);
		return this.getCustomer(id);
	}

	async deleteCustomer(id: string) {
		const cleanUp = async () => {
			const orders = await this.prismaService.$transaction(async (tx) => {
				await tx.cartItem.deleteMany({
					where: { customer_id: id },
				});

				return tx.order.updateManyAndReturn({
					data: { customer_id: null },
					select: { status: true, total_price: true },
					where: { customer_id: id },
				});
			});

			const cancelledOrders = orders.filter(
				({ status }) => status === 'CANCELLED',
			).length;

			const grandTotalPrice = orders
				.filter(({ status }) => status === 'DELIVERED')
				.reduce((sum, { total_price }) => sum + total_price, 0);

			return { cancelledOrders, grandTotalPrice, orders };
		};

		return this.usersService.deleteUser(
			id,
			{
				customer_id: id,
				status: {
					notIn: ['CANCELLED', 'DELIVERED', 'FAILED', 'REJECTED'],
				},
			},
			cleanUp,
		);
	}
}
