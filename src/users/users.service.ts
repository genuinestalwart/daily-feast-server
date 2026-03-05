import { ConflictException, Injectable } from '@nestjs/common';
import { Auth0Service } from 'src/auth0/auth0.service';
import { ROLES } from 'src/common/constants/roles';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserBody } from './dto/update-user-body.dto';
import { AuthUser } from 'src/common/types/auth-user.type';
import { OrderStatus, Prisma } from 'prisma/generated/client';

@Injectable()
export class UsersService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
	) {}

	private async getTags(id: string) {
		const { tags } = await this.prismaService.restaurant.findUniqueOrThrow({
			select: { tags: true },
			where: { id },
		});

		return tags;
	}

	private summarize(
		orders: { total_price: number; status: OrderStatus }[],
		otherStats: { [key: string]: number },
	) {
		return {
			failedOrders: orders.filter(({ status }) => status === 'FAILED')
				.length,
			successfulOrders: orders.filter(
				({ status }) => status === 'DELIVERED',
			).length,
			totalOrders: orders.length,
			...otherStats,
		};
	}

	private async deleteCustomer(id: string) {
		const orders = await this.prismaService.$transaction(async (tx) => {
			await tx.cartItem.deleteMany({ where: { customer_id: id } });

			return tx.order.updateManyAndReturn({
				data: { customer_id: null },
				select: { status: true, total_price: true },
				where: { customer_id: id },
			});
		});

		const otherStats = {
			cancelledOrders: orders.filter(
				({ status }) => status === 'CANCELLED',
			).length,
			grandTotalPrice: orders
				.filter(({ status }) => status === 'DELIVERED')
				.reduce((sum, { total_price }) => sum + total_price, 0),
		};

		return { orders, otherStats };
	}

	private async deleteRestaurant(id: string) {
		const menuItems = await this.prismaService.menuItem.count({
			where: { restaurant_id: id },
		});

		const orders = await this.prismaService.order.findMany({
			orderBy: { total_price: 'asc' },
			select: { status: true, total_price: true },
			where: { restaurant_id: id },
		});

		const otherStats = {
			grandTotalPrice: orders
				.filter(({ status }) => status === 'DELIVERED')
				.reduce((sum, { total_price }) => sum + total_price, 0),
			menuItems,
			rejectedOrders: orders.filter(({ status }) => status === 'REJECTED')
				.length,
		};

		await this.prismaService.restaurant.delete({ where: { id } });
		return { orders, otherStats };
	}

	private async deleteRider(id: string) {
		const orders = await this.prismaService.order.updateManyAndReturn({
			data: { rider_id: null },
			select: { status: true, total_price: true },
			where: { rider_id: id },
		});

		return { orders, otherStats: {} };
	}

	async getUser(currentUser: AuthUser) {
		const { id, role } = currentUser;
		const user = await this.auth0Service.users.get(id);
		const isRestaurant = role === ROLES.RESTAURANT;
		const tags = isRestaurant ? await this.getTags(id) : undefined;

		return {
			created_at: user.created_at,
			email: user.email,
			email_verified: user.email_verified,
			id,
			identities: user.identities,
			name: user.name,
			picture: user.picture,
			role: role.slice(3),
			tags,
			updated_at: user.updated_at,
		};
	}

	async updateUser(currentUser: AuthUser, dto: UpdateUserBody) {
		const { id, role } = currentUser;
		const { name, picture, tags } = dto;

		const updateInAuth0 = async () =>
			this.auth0Service.users.update(id, { name, picture });

		const updateInPrisma = async () =>
			this.prismaService.restaurant.update({
				data: { name, tags },
				where: { id },
			});

		if (name || picture) {
			await updateInAuth0();
		}

		if (tags && role === ROLES.RESTAURANT) {
			await updateInPrisma();
		}

		return this.getUser(currentUser);
	}

	async deleteUser(currentUser: AuthUser) {
		const { id, role } = currentUser;

		// role based definition of which orders should be considered as active
		const ordersByRole: Record<string, Prisma.OrderWhereInput> = {
			[ROLES.CUSTOMER]: {
				customer_id: id,
				status: {
					notIn: ['CANCELLED', 'DELIVERED', 'FAILED', 'REJECTED'],
				},
			},
			[ROLES.RESTAURANT]: {
				restaurant_id: id,
				status: {
					notIn: [
						'CANCELLED',
						'DELIVERED',
						'FAILED',
						'PENDING',
						'REJECTED',
					],
				},
			},
			[ROLES.RIDER]: {
				rider_id: id,
				status: { in: ['PICKED_UP', 'IN_TRANSIT'] },
			},
		};

		// User can't be deleted if an order is still ongoing
		const activeOrders = await this.prismaService.order.count({
			where: ordersByRole[role],
		});

		if (activeOrders) {
			throw new ConflictException();
		}

		const cleanUpByRole = {
			[ROLES.CUSTOMER]: async () => this.deleteCustomer(id),
			[ROLES.RESTAURANT]: async () => this.deleteRestaurant(id),
			[ROLES.RIDER]: async () => this.deleteRider(id),
		};

		const { orders, otherStats } = await cleanUpByRole[role]();
		await this.auth0Service.users.delete(id);
		return this.summarize(orders, otherStats);
	}
}
