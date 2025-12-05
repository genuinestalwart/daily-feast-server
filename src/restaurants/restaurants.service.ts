import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Auth0Service } from 'src/auth0/auth0.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES } from 'src/shared/constants/roles';
import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';
import { GetRestaurantsDTO } from './dto/get-restaurants.dto';
import { Prisma } from 'prisma/generated/client';

@Injectable()
export class RestaurantsService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
	) {}

	async createRestaurant(id: string, name: string) {
		return this.prismaService.restaurant.create({ data: { id, name } });
	}

	async getRestaurants(query: GetRestaurantsDTO) {
		const mode: Prisma.QueryMode = 'insensitive';
		const name = { contains: query.search as string, mode };
		const tags = { has: query.search as string };

		const restaurants = await this.prismaService.restaurant.findMany({
			omit: { name: true },
			skip: query.skip ?? 0,
			take: Math.min(query.take ?? 20, 100),
			where: { OR: query.search ? [{ name }, { tags }] : undefined },
		});

		const { data } = await this.auth0Service.users.list({
			fields: 'created_at,name,picture,user_id',
			include_fields: true,
			page: 0,
			per_page: Math.min(query.take ?? 20, 100),
			primary_order: false,
			q: restaurants.map(({ id }) => `user_id:"${id}"`).join(' OR '),
			search_engine: 'v3',
		});

		// merge two arrays of restaurants into one array based on id===user_id
		const userMap = new Map(data.map((user) => [user.user_id, user]));

		const result = restaurants.map(({ id, tags }) => ({
			created_at: userMap.get(id)?.created_at,
			id,
			name: userMap.get(id)?.name,
			picture: userMap.get(id)?.picture,
			role: 'RESTAURANT',
			tags,
		}));

		return result;
	}

	async getMyRestaurant(id: string) {
		const restaurant = await this.auth0Service.users.get(id);
		const { data } = await this.auth0Service.users.roles.list(id);

		// Not having the RESTAURANT role means the user doesn't exist as a restaurant
		if (!data.map((role) => role.name).includes(ROLES.RESTAURANT)) {
			throw new NotFoundException();
		}

		const { tags } = await this.prismaService.restaurant.findUniqueOrThrow({
			select: { tags: true },
			where: { id },
		});

		return {
			created_at: restaurant.created_at,
			email: restaurant.email,
			email_verified: restaurant.email_verified,
			id,
			name: restaurant.name,
			picture: restaurant.picture,
			role: 'RESTAURANT',
			tags,
			updated_at: restaurant.updated_at,
		};
	}

	async getRestaurantByID(id: string) {
		const restaurant = await this.auth0Service.users.get(id);
		const { data } = await this.auth0Service.users.roles.list(id);
		const { created_at, name, picture } = restaurant;

		// Not having the RESTAURANT role means the user doesn't exist as a restaurant
		if (!data.map((role) => role.name).includes(ROLES.RESTAURANT)) {
			throw new NotFoundException();
		}

		const { tags } = await this.prismaService.restaurant.findUniqueOrThrow({
			select: { tags: true },
			where: { id },
		});

		return { created_at, id, name, picture, role: 'RESTAURANT', tags };
	}

	async updateRestaurant(id: string, dto: UpdateRestaurantDTO) {
		const { name, picture, tags } = dto;
		const updateInAuth0 = () =>
			this.auth0Service.users.update(id, { name, picture });
		const updateInPrisma = () =>
			this.prismaService.restaurant.update({
				data: { tags },
				where: { id },
			});

		if ((name || picture) && tags) {
			await updateInPrisma();
			return updateInAuth0();
		} else if (tags) {
			return updateInPrisma();
		} else {
			return updateInAuth0();
		}
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

		const menuItems = await this.prismaService.menuItem.count({
			where: { restaurant_id: id },
		});

		const orders = await this.prismaService.order.findMany({
			orderBy: { total_price: 'asc' },
			select: { status: true, total_price: true },
			where: { restaurant_id: id },
		});

		await this.prismaService.restaurant.delete({ where: { id } });
		await this.auth0Service.users.delete(id);

		return {
			failedOrders: orders.filter(({ status }) => status === 'FAILED')
				.length,
			grandTotalPrice: orders
				.filter(({ status }) => status === 'DELIVERED')
				.reduce((sum, { total_price }) => sum + total_price, 0),
			menuItems,
			rejectedOrders: orders.filter(({ status }) => status === 'REJECTED')
				.length,
			successfulOrders: orders.filter(
				({ status }) => status === 'DELIVERED',
			).length,
			totalOrders: orders.length,
		};
	}
}
