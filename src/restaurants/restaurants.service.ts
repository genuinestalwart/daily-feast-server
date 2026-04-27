import { Injectable } from '@nestjs/common';
import { Auth0Service } from 'src/auth0/auth0.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES } from 'src/common/constants/roles';
import {
	GetRestaurantsQuery,
	RestaurantSortBy,
	RestaurantSortOrder,
} from './dto/get-restaurants-query.dto';
import { Prisma } from 'prisma/generated/client';

@Injectable()
export class RestaurantsService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
	) {}

	async getRestaurants(query: GetRestaurantsQuery) {
		const mode: Prisma.QueryMode = 'insensitive';
		const name = { contains: query.search as string, mode };
		const tags = { has: query.search as string };

		const {
			sort_by = RestaurantSortBy.completedOrdersCount,
			sort_order = RestaurantSortOrder.desc,
		} = query;

		const restaurants = await this.prismaService.restaurant.findMany({
			omit: { name: true },
			skip: query.skip ?? undefined,
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

		const result = restaurants.map(({ completedOrdersCount, id, tags }) => {
			const user = userMap.get(id);

			return {
				completedOrdersCount,
				created_at: user?.created_at ?? '',
				id,
				name: user?.name ?? '',
				picture: user?.picture ?? '',
				role: ROLES.RESTAURANT.slice(3),
				tags,
			};
		});

		// Sort the result based on the specified sort_by and sort_order
		const comparator: Record<
			RestaurantSortBy,
			(a: (typeof result)[0], b: (typeof result)[0]) => number
		> = {
			[RestaurantSortBy.name]: (a, b) => a.name.localeCompare(b.name),
			[RestaurantSortBy.completedOrdersCount]: (a, b) =>
				a.completedOrdersCount - b.completedOrdersCount,
			[RestaurantSortBy.created_at]: (a, b) => {
				const dateA = Date.parse(a.created_at as string);
				const dateB = Date.parse(b.created_at as string);
				return (dateA || 0) - (dateB || 0);
			},
		};

		const sortedResult = [...result].sort((a, b) => {
			const direction = sort_order === RestaurantSortOrder.asc ? 1 : -1;
			return comparator[sort_by](a, b) * direction;
		});

		return sortedResult;
	}

	async getRestaurantById(id: string) {
		const user = await this.auth0Service.users.get(id);

		const restaurant =
			await this.prismaService.restaurant.findUniqueOrThrow({
				select: { completedOrdersCount: true, tags: true },
				where: { id },
			});

		return {
			completedOrdersCount: restaurant.completedOrdersCount,
			created_at: user.created_at,
			id: user.user_id,
			name: user.name,
			picture: user.picture,
			role: ROLES.RESTAURANT.slice(3),
			tags: restaurant,
		};
	}
}
