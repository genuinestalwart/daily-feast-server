import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from 'prisma/generated/client';
import { Auth0Service } from 'src/auth0/auth0.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES } from '../constants/roles';

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
	async getUser(id: string, roleName: string, isOwner: boolean) {
		const isRestaurant = roleName === ROLES.RESTAURANT;
		const user = await this.auth0Service.users.get(id);
		const { data: userRoles } =
			await this.auth0Service.users.roles.list(id);

		const tags = isRestaurant
			? await this.prismaService.restaurant.findUniqueOrThrow({
					select: { tags: true },
					where: { id },
				})
			: undefined;

		if (!userRoles.map((role) => role.name).includes(roleName)) {
			throw new NotFoundException();
		}

		const ownerData = isOwner
			? {
					email: user.email,
					email_verified: user.email_verified,
					identities: user.identities,
					updated_at: user.updated_at,
				}
			: {};

		return {
			created_at: user.created_at,
			id: user.user_id,
			name: user.name,
			picture: user.picture,
			role: roleName.slice(3),
			...ownerData,
			...tags,
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
