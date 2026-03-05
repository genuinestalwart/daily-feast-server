import {
	BadRequestException,
	ConflictException,
	Injectable,
} from '@nestjs/common';
import { CreateOrderBody } from './dto/create-order-body.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderType, Prisma } from 'prisma/generated/client';
import { GetOrdersQuery } from './dto/get-orders-query.dto';
import { UpdateStatusBody } from './dto/update-status-body.dto';
import { ROLES } from 'src/common/constants/roles';
import type { AuthUser } from 'src/common/types/auth-user.type';

const order_include = {
	ordered_items: {
		include: { menu_item: { select: { id: true, name: true } } },
		omit: { menu_item_id: true, order_id: true },
	},
	restaurant: { select: { id: true, name: true } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
	constructor(private readonly prismaService: PrismaService) {}

	private getIdByRole(currentUser: AuthUser) {
		const idByRole = {
			[ROLES.CUSTOMER]: { customer_id: currentUser.id },
			[ROLES.RESTAURANT]: { restaurant_id: currentUser.id },
			[ROLES.RIDER]: { rider_id: currentUser.id },
		};

		return idByRole[currentUser.role];
	}

	async createOrder(customer_id: string, dto: CreateOrderBody) {
		const select = { id: true, price: true, restaurant_id: true };

		const cartItems = await this.prismaService.cartItem.findMany({
			select: { id: true, amount: true, menu_item: { select } },
			where: { customer_id },
		});

		if (!cartItems.length) {
			throw new BadRequestException();
		}

		// group cartItems based on restaurant_id
		const itemsByRestaurant = cartItems.reduce<
			Record<string, typeof cartItems>
		>((accumulator, item) => {
			const restaurant_id = item.menu_item.restaurant_id;

			if (!accumulator[restaurant_id]) {
				accumulator[restaurant_id] = [];
			}

			accumulator[restaurant_id].push(item);
			return accumulator;
		}, {});

		return this.prismaService.$transaction(async (tx) => {
			const orders: Prisma.OrderGetPayload<{
				include: typeof order_include;
				omit: { restaurant_id: true };
			}>[] = [];

			for (const [restaurant_id, items] of Object.entries(
				itemsByRestaurant,
			)) {
				const total_price = items.reduce((total, item) => {
					return total + item.menu_item.price * item.amount;
				}, 0);

				const order = await tx.order.create({
					data: {
						customer_id,
						ordered_items: {
							create: items.map((item) => ({
								amount: item.amount,
								menu_item_id: item.menu_item.id,
								price_per_item: item.menu_item.price,
							})),
						},
						restaurant_id,
						total_price,
						type: dto.type,
					},
					include: order_include,
					omit: { restaurant_id: true },
				});

				orders.push(order);
			}

			await tx.cartItem.deleteMany({ where: { customer_id } });
			return orders;
		});
	}

	async getOrderById(currentUser: AuthUser, id: string) {
		return this.prismaService.order.findUniqueOrThrow({
			include: order_include,
			omit: { restaurant_id: true },
			where: { id, ...this.getIdByRole(currentUser) },
		});
	}

	async getOrders(currentUser: AuthUser, dto: GetOrdersQuery) {
		return this.prismaService.order.findMany({
			include: order_include,
			omit: { restaurant_id: true },
			where: { ...dto, ...this.getIdByRole(currentUser) },
		});
	}

	async updateStatus(
		currentUser: AuthUser,
		dto: UpdateStatusBody,
		id: string,
	) {
		const { status, type: orderType } =
			await this.prismaService.order.findUniqueOrThrow({
				select: { status: true, type: true },
				where: { id, ...this.getIdByRole(currentUser) },
			});

		// currentStatus => nextValidStatuses
		const transitionsByRole = {
			[ROLES.CUSTOMER]: {
				PENDING: ['CANCELLED'],
				ACCEPTED: ['CANCELLED'],
			},
			[ROLES.RESTAURANT]: {
				PENDING: ['ACCEPTED', 'REJECTED'],
				ACCEPTED: ['PREPARING'],
				PREPARING: ['READY_FOR_PICKUP'],
				READY_FOR_PICKUP: (orderType: OrderType) =>
					orderType === 'PICKUP' ? ['DELIVERED'] : [],
			},
			[ROLES.RIDER]: {
				READY_FOR_PICKUP: ['PICKED_UP'],
				PICKED_UP: ['RETURNED', 'IN_TRANSIT'],
				IN_TRANSIT: (orderType: OrderType) =>
					orderType === 'DELIVERY' ? ['DELIVERED'] : [],
			},
		};

		const roleTransitions = transitionsByRole[currentUser.role];
		const rule = roleTransitions?.[status];
		const allowedNext = typeof rule === 'function' ? rule(orderType) : rule;

		// if the requested status is valid for transition
		if (allowedNext?.includes(dto.status) ?? false) {
			return this.prismaService.order.update({
				data: { status: dto.status },
				include: order_include,
				omit: { restaurant_id: true },
				where: { id, ...this.getIdByRole(currentUser) },
			});
		} else {
			throw new ConflictException();
		}
	}
}
