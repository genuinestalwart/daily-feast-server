import { Injectable } from '@nestjs/common';
import { Auth0Service } from 'src/auth0/auth0.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES } from 'src/common/constants/roles';
import { UpdateRestaurantBody } from './dto/update-restaurant-body.dto';
import { GetRestaurantsQuery } from './dto/get-restaurants-query.dto';
import { Prisma } from 'prisma/generated/client';
import { UsersService } from 'src/common/services/users.service';

@Injectable()
export class RestaurantsService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
		private readonly usersService: UsersService,
	) {}

	async createRestaurant(id: string) {
		const user = await this.auth0Service.users.get(id);
		const data = { id, name: user.name as string };
		await this.prismaService.restaurant.create({ data });
		return this.getMyRestaurant(id);
	}

	async getRestaurants(query: GetRestaurantsQuery) {
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

		// merge two arrays of restaurants into one array based on id === user_id
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
		return this.usersService.getUser(id, ROLES.RESTAURANT, { byID: false });
	}

	async getRestaurantByID(id: string) {
		return this.usersService.getUser(id, ROLES.RESTAURANT, { byID: true });
	}

	async updateRestaurant(id: string, dto: UpdateRestaurantBody) {
		const { name, picture, tags } = dto;

		const updateInAuth0 = async () =>
			this.auth0Service.users.update(id, { name, picture });

		const updateInPrisma = async () =>
			this.prismaService.restaurant.update({
				data: { name, tags },
				where: { id },
			});

		if ((name || picture) && tags) {
			await updateInPrisma();
			await updateInAuth0();
		} else if (tags) {
			await updateInPrisma();
		} else {
			await updateInAuth0();
		}

		return this.getMyRestaurant(id);
	}

	async deleteRestaurant(id: string) {
		const cleanUp = async () => {
			const menuItems = await this.prismaService.menuItem.count({
				where: { restaurant_id: id },
			});

			const orders = await this.prismaService.order.findMany({
				orderBy: { total_price: 'asc' },
				select: { status: true, total_price: true },
				where: { restaurant_id: id },
			});

			const grandTotalPrice = orders
				.filter(({ status }) => status === 'DELIVERED')
				.reduce((sum, { total_price }) => sum + total_price, 0);

			const rejectedOrders = orders.filter(
				({ status }) => status === 'REJECTED',
			).length;

			await this.prismaService.restaurant.delete({ where: { id } });
			return { grandTotalPrice, menuItems, orders, rejectedOrders };
		};

		return this.usersService.deleteUser(
			id,
			{
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
			cleanUp,
		);
	}
}
