import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from 'prisma/generated/client';
import { Auth0Service } from 'src/auth0/auth0.service';
import { PrismaService } from 'src/prisma/prisma.service';

interface Restaurant {
	byID: boolean;
}

interface AccountSummary {
	cancelledOrders?: number;
	grandTotalPrice?: number;
	menuItems?: number;
	orders: { status: OrderStatus; total_price: number }[];
	rejectedOrders?: number;
}

@Injectable()
export class UsersService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
	) {}

	// get 'CUSTOMER' | 'RESTAURANT' | 'RIDER'
	async getUser(id: string, roleName: string, restaurant?: Restaurant) {
		// This makes sure whether it's a public request for restaurant or not
		const byID = restaurant && restaurant.byID;
		const user = await this.auth0Service.users.get(id);
		const { data } = await this.auth0Service.users.roles.list(id);

		const tags = restaurant
			? await this.prismaService.restaurant.findUniqueOrThrow({
					select: { tags: true },
					where: { id },
				})
			: undefined;

		if (!data.map((role) => role.name).includes(roleName)) {
			throw new NotFoundException();
		}

		return {
			created_at: user.created_at,
			email: byID ? undefined : user.email,
			email_verified: byID ? undefined : user.email_verified,
			id: user.user_id,
			identities: restaurant ? undefined : user.identities,
			name: user.name,
			picture: user.picture,
			role: roleName.slice(3),
			...tags,
			updated_at: byID ? undefined : user.updated_at,
		};
	}

	// delete 'CUSTOMER' | 'RESTAURANT' | 'RIDER'
	async deleteUser(
		id: string,
		where: Prisma.OrderWhereInput,
		cleanUp: () => Promise<AccountSummary>,
	) {
		// User can't be deleted if an order is still ongoing
		const activeOrders = await this.prismaService.order.count({ where });

		if (activeOrders) {
			throw new ConflictException();
		}

		const {
			cancelledOrders,
			grandTotalPrice,
			menuItems,
			orders,
			rejectedOrders,
		} = await cleanUp();

		await this.auth0Service.users.delete(id);

		return {
			cancelledOrders,
			grandTotalPrice,
			failedOrders: orders.filter(({ status }) => status === 'FAILED')
				.length,
			menuItems,
			rejectedOrders,
			successfulOrders: orders.filter(
				({ status }) => status === 'DELIVERED',
			).length,
			totalOrders: orders.length,
		};
	}
}
