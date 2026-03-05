import { Injectable } from '@nestjs/common';
import { Auth0Service } from 'src/auth0/auth0.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES } from 'src/common/constants/roles';
import { GetRestaurantsQuery } from './dto/get-restaurants-query.dto';
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
			role: ROLES.RESTAURANT.slice(3),
			tags,
		}));

		return result;
	}

	async getRestaurantById(id: string) {
		const user = await this.auth0Service.users.get(id);

		const tags = await this.prismaService.restaurant.findUniqueOrThrow({
			select: { tags: true },
			where: { id },
		});

		return {
			created_at: user.created_at,
			id: user.user_id,
			name: user.name,
			picture: user.picture,
			role: ROLES.RESTAURANT.slice(3),
			tags,
		};
	}
}
