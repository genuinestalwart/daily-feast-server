import { ConflictException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Prisma } from 'prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES } from 'src/shared/constants/roles';
import { ensureOwnership } from 'src/shared/utils/ensureOwnership';
import { GetMenuItemsDTO } from './dto/get-menu-items.dto';
import { CreateMenuItemDTO } from './dto/create-menu-item.dto';
import { GetMyMenuItemsDTO } from './dto/get-my-menu-items.dto';

@Injectable()
export class MenuItemsService {
	constructor(private readonly prismaService: PrismaService) {}

	async createMenuItem(id: string, dto: CreateMenuItemDTO) {
		return this.prismaService.menuItem.create({
			data: { ...dto, restaurant: { connect: { id } } },
		});
	}

	async getMenuItems(query: GetMenuItemsDTO) {
		const mode: Prisma.QueryMode = 'insensitive';
		const description = { contains: query.search as string, mode };
		const name = { contains: query.search as string, mode };

		const { maxPrepTime, minPrepTime, sort_by, sort_order } = query;
		const prep_time = { gte: minPrepTime, lte: maxPrepTime };
		const price = { gte: query.minPrice, lte: query.maxPrice };

		return this.prismaService.menuItem.findMany({
			omit: { available: true, status: true, updated_at: true },
			orderBy: { [sort_by ?? 'created_at']: sort_order ?? 'desc' },
			skip: query.skip ?? 0,
			take: Math.min(query.take ?? 20, 100),
			where: {
				available: true,
				status: 'APPROVED',
				category: query.category,
				...(minPrepTime || maxPrepTime ? { prep_time } : {}),
				...(query.minPrice || query.maxPrice ? { price } : {}),
				OR: query.search ? [{ description }, { name }] : undefined,
			},
		});
	}

	async getMenuItemByID(id: string) {
		return this.prismaService.menuItem.findUniqueOrThrow({
			omit: { available: true, status: true, updated_at: true },
			where: { available: true, id, status: 'APPROVED' },
		});
	}

	async getMyMenuItems(restaurant_id: string, query: GetMyMenuItemsDTO) {
		const mode: Prisma.QueryMode = 'insensitive';
		const description = { contains: query.search as string, mode };
		const name = { contains: query.search as string, mode };

		return this.prismaService.menuItem.findMany({
			orderBy: {
				[query.sort_by ?? 'created_at']: query.sort_order ?? 'desc',
			},
			skip: query.skip ?? 0,
			take: Math.min(query.take ?? 20, 100),
			where: {
				available: query.available,
				category: query.category,
				restaurant_id,
				status: query.status,
				OR: query.search ? [{ description }, { name }] : undefined,
			},
		});
	}

	async getMyMenuItemByID(restaurant_id: string, id: string) {
		return this.prismaService.menuItem.findUniqueOrThrow({
			where: { id, restaurant_id },
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

		ensureOwnership(request, ROLES.RESTAURANT, restaurant_id);

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

		return this.prismaService.menuItem.delete({ where: { id } });
	}
}
