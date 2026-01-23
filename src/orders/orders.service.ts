import {
	BadRequestException,
	ConflictException,
	Injectable,
} from '@nestjs/common';
import { CreateOrderBody } from './dto/create-order-body.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'prisma/generated/client';
import { GetOrdersQuery } from './dto/get-orders-query.dto';
import { UpdateStatusBody } from './dto/update-status-body.dto';
import { ROLES } from 'src/common/constants/roles';

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

	private determineRoleOfUser(userID: string, roles: string[]) {
		if (roles.includes(ROLES.CUSTOMER)) {
			return { customer_id: userID };
		} else if (roles.includes(ROLES.RESTAURANT)) {
			return { restaurant_id: userID };
		} else if (roles.includes(ROLES.RIDER)) {
			return { rider_id: userID };
		} else {
			return {};
		}
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

	async getOrderByID(id: string, userID: string, roles: string[]) {
		return this.prismaService.order.findUniqueOrThrow({
			include: order_include,
			omit: { restaurant_id: true },
			where: { id, ...this.determineRoleOfUser(userID, roles) },
		});
	}

	async getOrders(dto: GetOrdersQuery, userID: string, roles: string[]) {
		return this.prismaService.order.findMany({
			include: order_include,
			omit: { restaurant_id: true },
			where: { ...dto, ...this.determineRoleOfUser(userID, roles) },
		});
	}

	async updateStatus(
		id: string,
		dto: UpdateStatusBody,
		userID: string,
		roles: string[],
	) {
		const { status, type: orderType } =
			await this.prismaService.order.findUniqueOrThrow({
				select: { status: true, type: true },
				where: { id, ...this.determineRoleOfUser(userID, roles) },
			});

		const isCustomer = roles.includes(ROLES.CUSTOMER),
			isRestaurant = roles.includes(ROLES.RESTAURANT),
			isRider = roles.includes(ROLES.RIDER);

		const customerTransitions = {
			PENDING: ['CANCELLED'],
			ACCEPTED: ['CANCELLED'],
		};

		const restaurantTransitions = {
			PENDING: ['ACCEPTED', 'REJECTED'],
			ACCEPTED: ['PREPARING'],
			PREPARING: ['READY_FOR_PICKUP'],
		};

		const riderTransitions = {
			READY_FOR_PICKUP: ['PICKED_UP'],
			PICKED_UP: ['RETURNED', 'IN_TRANSIT'],
		};

		const isValidTransition =
			(isCustomer && customerTransitions[status]?.includes(dto.status)) ||
			(isRestaurant &&
				(restaurantTransitions[status]?.includes(dto.status) ||
					(orderType === 'PICKUP' &&
						status === 'READY_FOR_PICKUP' &&
						dto.status === 'DELIVERED'))) ||
			(isRider &&
				(riderTransitions[status]?.includes(dto.status) ||
					(orderType === 'DELIVERY' &&
						status === 'IN_TRANSIT' &&
						dto.status === 'DELIVERED')));

		if (isValidTransition) {
			return this.prismaService.order.update({
				data: { status: dto.status },
				include: order_include,
				omit: { restaurant_id: true },
				where: { id, ...this.determineRoleOfUser(userID, roles) },
			});
		} else {
			throw new ConflictException();
		}
	}
}
