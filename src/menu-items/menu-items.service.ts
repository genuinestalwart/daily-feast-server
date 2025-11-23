import { ConflictException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Prisma } from 'prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES } from 'src/shared/constants/roles';
import { ensureOwnership } from 'src/shared/utils/ensureOwnership';
import { GetManyMenuItemsDTO } from './dto/get-many-menu-items.dto';

@Injectable()
export class MenuItemsService {
	constructor(private readonly prismaService: PrismaService) {}

	async createMenuItem(input: Prisma.MenuItemCreateInput) {
		return this.prismaService.menuItem.create({ data: input });
	}

	async getMenuItem(id: string) {
		return this.prismaService.menuItem.findUniqueOrThrow({
			omit: { available: true, status: true, updated_at: true },
			where: { available: true, id, status: 'APPROVED' },
		});
	}

	async getManyMenuItems(query: GetManyMenuItemsDTO) {
		const mode = 'insensitive';
		const prep_time = { gte: query.minPrepTime, lte: query.maxPrepTime };
		const price = { gte: query.minPrice, lte: query.maxPrice };

		const where: Prisma.MenuItemWhereInput = {
			available: true,
			status: 'APPROVED',
			category: query.category,
			restaurant_id: query.restaurant_id,
			...(query.minPrepTime || query.maxPrepTime ? { prep_time } : {}),
			...(query.minPrice || query.maxPrice ? { price } : {}),
			...(query.tags?.length ? { tags: { hasEvery: query.tags } } : {}),
			OR: query.name
				? [
						{ description: { contains: query.name, mode } },
						{ name: { contains: query.name, mode } },
					]
				: undefined,
		};

		return this.prismaService.menuItem.findMany({
			omit: { available: true, status: true, updated_at: true },
			skip: query.skip ?? 0,
			take: Math.min(query.take ?? 20, 100),
			where,
		});
	}

	async updateMenuItem(
		id: string,
		input: Prisma.MenuItemUpdateInput,
		request: Request,
	) {
		const { restaurant_id, status } =
			await this.prismaService.menuItem.findUniqueOrThrow({
				select: { restaurant_id: true, status: true },
				where: { id },
			});

		ensureOwnership(request, ROLES.RESTAURANT, restaurant_id);

		return this.prismaService.menuItem.update({
			data: {
				available: input.available,
				description: input.description,
				image: input.image,
				name: input.name,
				prep_time: input.prep_time,
				price: input.price,
				status: status === 'DENIED' ? 'KEPT_AS_DRAFT' : undefined,
				tags: input.tags,
			},
			where: { id },
		});
	}

	async submitMenuItem(id: string, request: Request) {
		const { restaurant_id, status } =
			await this.prismaService.menuItem.findUniqueOrThrow({
				select: { restaurant_id: true, status: true },
				where: { id },
			});

		ensureOwnership(request, ROLES.RESTAURANT, restaurant_id);

		if (status !== 'KEPT_AS_DRAFT') {
			throw new ConflictException();
		}

		return this.prismaService.menuItem.update({
			data: { status: 'PENDING_APPROVAL' },
			where: { id },
		});
	}

	async deleteMenuItem(id: string, request: Request) {
		const { restaurant_id } =
			await this.prismaService.menuItem.findUniqueOrThrow({
				select: { restaurant_id: true },
				where: { id },
			});

		// Menu Item can't be deleted if an order is still ongoing
		const activeOrders = await this.prismaService.order.count({
			where: {
				ordered_items: { some: { menu_item_id: id } },
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

		ensureOwnership(request, ROLES.RESTAURANT, restaurant_id);
		return this.prismaService.menuItem.delete({ where: { id } });
	}
}
