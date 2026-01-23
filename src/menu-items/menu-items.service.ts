import {
	ConflictException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetMenuItemsQuery } from './dto/get-menu-items-query.dto';
import { CreateMenuItemBody } from './dto/create-menu-item-body.dto';
import { GetMyMenuItemsQuery } from './dto/get-my-menu-items-query.dto';
import { IntersectionType, OmitType } from '@nestjs/swagger';
import { UpdateMenuItemBody } from './dto/update-menu-item-body.dto';

interface User {
	isRestaurant: boolean;
	userID: string;
}

// Combined DTO for internal use in `findMenuItems()`
class FindMenuItemsQuery extends IntersectionType(
	OmitType(GetMenuItemsQuery, ['sort_by'] as const),
	GetMyMenuItemsQuery,
) {}

@Injectable()
export class MenuItemsService {
	constructor(private readonly prismaService: PrismaService) {}

	// DRY method for `getMenuItems()` and `getMyMenuItems()`
	private async findMenuItems(q: FindMenuItemsQuery, restaurant_id?: string) {
		const mode: Prisma.QueryMode = 'insensitive';
		const description = { contains: q.search as string, mode };
		const name = { contains: q.search as string, mode };
		const omit = { available: true, status: true };
		const prep_time = { gte: q.minPrepTime, lte: q.maxPrepTime };
		const price = { gte: q.minPrice, lte: q.maxPrice };

		const where: Prisma.MenuItemWhereInput = {
			available: q.available ?? true,
			category: q.category,
			OR: q.search ? [{ description }, { name }] : undefined,
			prep_time: q.maxPrepTime || q.minPrepTime ? prep_time : undefined,
			price: q.maxPrice || q.minPrice ? price : undefined,
			restaurant_id,
			status: q.status ?? 'APPROVED',
		};

		return this.prismaService.menuItem.findMany({
			omit: !restaurant_id ? omit : undefined,
			orderBy: { [q.sort_by ?? 'created_at']: q.sort_order ?? 'desc' },
			skip: q.skip ?? 0,
			take: Math.min(q.take ?? 20, 100),
			where,
		});
	}

	private async ensureOwnership(id: string, user: User) {
		const { restaurant_id, status } =
			await this.prismaService.menuItem.findUniqueOrThrow({
				where: { id },
			});

		if (user.isRestaurant && user.userID !== restaurant_id) {
			throw new ForbiddenException();
		}

		return status;
	}

	private async ensureNoActiveOrders(id: string, user: User) {
		const activeOrders = await this.prismaService.order.count({
			where: {
				ordered_items: { some: { menu_item_id: id } },
				restaurant_id: user.userID,
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
	}

	async createMenuItem(id: string, dto: CreateMenuItemBody) {
		return this.prismaService.menuItem.create({
			data: { ...dto, restaurant: { connect: { id } } },
		});
	}

	async getMenuItems(query: GetMenuItemsQuery) {
		return this.findMenuItems(query);
	}

	async getMenuItemByID(id: string) {
		return this.prismaService.menuItem.findUniqueOrThrow({
			omit: { available: true, status: true },
			where: { available: true, id, status: 'APPROVED' },
		});
	}

	async getMyMenuItems(restaurant_id: string, query: GetMyMenuItemsQuery) {
		return this.findMenuItems(query, restaurant_id);
	}

	async getMyMenuItemByID(restaurant_id: string, id: string) {
		return this.prismaService.menuItem.findUniqueOrThrow({
			where: { id, restaurant_id },
		});
	}

	async updateMenuItem(id: string, dto: UpdateMenuItemBody, user: User) {
		const status = await this.ensureOwnership(id, user);
		const denied = status === 'DENIED';

		if (dto.available || dto.available === false || dto.price) {
			await this.ensureNoActiveOrders(id, user);
		}

		return this.prismaService.menuItem.update({
			data: { ...dto, status: denied ? 'KEPT_AS_DRAFT' : undefined },
			where: { id },
		});
	}

	async submitForApproval(id: string, user: User) {
		const status = await this.ensureOwnership(id, user);

		if (status !== 'KEPT_AS_DRAFT') {
			throw new ConflictException();
		}

		return this.prismaService.menuItem.update({
			data: { status: 'PENDING_APPROVAL' },
			where: { id },
		});
	}

	async deleteMenuItem(id: string, user: User) {
		await this.ensureOwnership(id, user);
		await this.ensureNoActiveOrders(id, user);
		await this.prismaService.menuItem.delete({ where: { id } });
	}
}
