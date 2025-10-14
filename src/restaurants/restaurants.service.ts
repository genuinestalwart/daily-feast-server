import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RestaurantsService {
	constructor(private readonly prismaService: PrismaService) {}

	async createRestaurant(restaurantCreateInput: Prisma.UserCreateInput) {
		return this.prismaService.user.create({ data: restaurantCreateInput });
	}
}
