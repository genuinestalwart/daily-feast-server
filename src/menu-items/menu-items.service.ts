import {
	ConflictException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuItemBody } from './dto/create-menu-item-body.dto';
import { IntersectionType } from '@nestjs/swagger';
import { UpdateMenuItemBody } from './dto/update-menu-item-body.dto';
import {
	GetMenuItemsQuery,
	GetMyMenuItemsQuery,
	MenuItemsSortBy,
	MenuItemsSortOrder,
} from './dto/menu-items-query.dto';

// Combined DTO for internal use in `findMenuItems()`
class FindMenuItemsQuery extends IntersectionType(
	GetMenuItemsQuery,
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

		const {
			sort_by = MenuItemsSortBy.created_at,
			sort_order = MenuItemsSortOrder.desc,
		} = q;

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
			orderBy: { [sort_by]: sort_order },
			skip: q.skip ?? undefined,
			take: Math.min(q.take ?? 20, 100),
			where,
		});
	}

	private async ensureOwnership(restaurant_id: string, id: string) {
		const menuItem = await this.prismaService.menuItem.findUniqueOrThrow({
			select: { available: true, restaurant_id: true, status: true },
			where: { id },
		});

		if (restaurant_id !== menuItem.restaurant_id) {
			throw new ForbiddenException();
		}

		return menuItem;
	}

	private async ensureNoActiveOrders(restaurant_id: string, id: string) {
		const activeOrders = await this.prismaService.order.count({
			where: {
				ordered_items: { some: { menu_item_id: id } },
				restaurant_id,
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

	async getMenuItemById(id: string) {
		return this.prismaService.menuItem.findUniqueOrThrow({
			omit: { available: true, status: true },
			where: { available: true, id, status: 'APPROVED' },
		});
	}

	async getMyMenuItems(restaurant_id: string, query: GetMyMenuItemsQuery) {
		return this.findMenuItems(query, restaurant_id);
	}

	async getMyMenuItemById(restaurant_id: string, id: string) {
		return this.prismaService.menuItem.findUniqueOrThrow({
			where: { id, restaurant_id },
		});
	}

	async updateMenuItem(
		restaurant_id: string,
		dto: UpdateMenuItemBody,
		id: string,
	) {
		const menuItem = await this.ensureOwnership(restaurant_id, id);
		const isDenied = menuItem.status === 'DENIED';

		if (dto.available || dto.available === false || dto.price) {
			await this.ensureNoActiveOrders(restaurant_id, id);
		}

		return this.prismaService.menuItem.update({
			data: { ...dto, status: isDenied ? 'KEPT_AS_DRAFT' : undefined },
			where: { id },
		});
	}

	async submitForApproval(restaurant_id: string, id: string) {
		const menuItem = await this.ensureOwnership(restaurant_id, id);

		if (menuItem.status !== 'KEPT_AS_DRAFT') {
			throw new ConflictException();
		}

		return this.prismaService.menuItem.update({
			data: { status: 'PENDING_APPROVAL' },
			where: { id },
		});
	}

	async deleteMenuItem(restaurant_id: string, id: string) {
		const menuItem = await this.ensureOwnership(restaurant_id, id);

		if (menuItem.status === 'APPROVED' && menuItem.available) {
			await this.ensureNoActiveOrders(restaurant_id, id);
		}

		await this.prismaService.menuItem.delete({ where: { id } });
	}
}
