import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Auth0Service } from 'src/auth0/auth0.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES } from 'src/shared/constants/roles';
import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';
import { GetManyMenuItemsDTO } from './dto/get-many-menu-items.dto';
import { Prisma } from 'prisma/generated/client';

@Injectable()
export class RestaurantsService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
	) {}

	async getRestaurant(id: string) {
		const restaurant = await this.auth0Service.users.get(id);
		const { data } = await this.auth0Service.users.roles.list(id);

		// Not having the RESTAURANT role means the user doesn't exist as a restaurant
		if (!data.map((role) => role.name).includes(ROLES.RESTAURANT)) {
			throw new NotFoundException();
		}

		return {
			created_at: restaurant.created_at,
			email: restaurant.email,
			email_verified: restaurant.email_verified,
			id: restaurant.user_id,
			name: restaurant.name,
			picture: restaurant.picture,
			role: 'RESTAURANT',
			updated_at: restaurant.updated_at,
		};
	}

	async updateRestaurant(id: string, dto: UpdateRestaurantDTO) {
		return this.auth0Service.users.update(id, dto);
	}

	async deleteRestaurant(id: string) {
		// Restaurant can't be deleted if an order is still ongoing
		const activeOrders = await this.prismaService.order.count({
			where: {
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
		});

		if (activeOrders) {
			throw new ConflictException();
		}

		const { menuItems, orders } = await this.prismaService.$transaction(
			async (tx) => {
				const { count } = await tx.menuItem.deleteMany({
					where: { restaurant_id: id },
				});

				const orders = await tx.order.updateManyAndReturn({
					data: { restaurant_id: null },
					select: { status: true, total_price: true },
					where: { restaurant_id: id },
				});

				return { menuItems: count, orders };
			},
		);

		await this.auth0Service.users.delete(id);

		return {
			failedOrders: orders.filter((order) => order.status === 'FAILED')
				.length,
			grandTotalPrice: orders
				.filter((order) => order.status === 'DELIVERED')
				.reduce((sum, order) => sum + order.total_price, 0),
			menuItems,
			rejectedOrders: orders.filter(
				(order) => order.status === 'REJECTED',
			).length,
			successfulOrders: orders.filter(
				(order) => order.status === 'DELIVERED',
			).length,
			totalOrders: orders.length,
		};
	}

	async getMenuItem(restaurant_id: string, id: string) {
		return this.prismaService.menuItem.findUniqueOrThrow({
			where: { id, restaurant_id },
		});
	}

	async getManyMenuItems(restaurant_id: string, query: GetManyMenuItemsDTO) {
		const mode = 'insensitive';

		const where: Prisma.MenuItemWhereInput = {
			available: query.available,
			category: query.category,
			restaurant_id,
			status: query.status,
			...(query.tags?.length ? { tags: { hasEvery: query.tags } } : {}),
			OR: query.name
				? [
						{ description: { contains: query.name, mode } },
						{ name: { contains: query.name, mode } },
					]
				: undefined,
		};

		return this.prismaService.menuItem.findMany({
			skip: query.skip ?? 0,
			take: Math.min(query.take ?? 20, 100),
			where,
		});
	}
}
