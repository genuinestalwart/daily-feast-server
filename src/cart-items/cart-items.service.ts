import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { AddToCartBody } from './dto/add-to-cart-body.dto';
import { UpdateAmountBody } from './dto/update-amount-body.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartItemsService {
	constructor(private readonly prismaService: PrismaService) {}

	private async ensureOwnership(customer_id: string, id: string) {
		const cartItem = await this.prismaService.cartItem.findUniqueOrThrow({
			where: { id },
		});

		if (customer_id !== cartItem.customer_id) {
			throw new ForbiddenException();
		}

		return cartItem;
	}

	async addToCart(customer_id: string, dto: AddToCartBody) {
		const { menu_item_id } = dto;

		return this.prismaService.cartItem.upsert({
			create: { customer_id, menu_item_id, amount: 1 },
			update: { amount: { increment: 1 } },
			where: { customer_id_menu_item_id: { customer_id, menu_item_id } },
		});
	}

	async getCartItems(customer_id: string) {
		return this.prismaService.cartItem.findMany({ where: { customer_id } });
	}

	async updateAmount(customer_id: string, id: string, dto: UpdateAmountBody) {
		const cartItem = await this.ensureOwnership(customer_id, id);

		return this.prismaService.$transaction(async (tx) => {
			if (dto.action === 'decrement' && dto.amount > cartItem.amount) {
				throw new BadRequestException();
			}

			const updatedCartItem = await tx.cartItem.update({
				where: { id },
				data: { amount: { [dto.action]: dto.amount } },
			});

			if (updatedCartItem.amount === 0) {
				await tx.cartItem.delete({ where: { id } });
				return { ...updatedCartItem, amount: 0, deleted: true };
			}

			return { ...updatedCartItem, deleted: false };
		});
	}

	async removeFromCart(customer_id: string, id: string) {
		await this.ensureOwnership(customer_id, id);
		await this.prismaService.cartItem.delete({ where: { id } });
	}

	async clearCart(customer_id: string) {
		await this.prismaService.cartItem.deleteMany({
			where: { customer_id },
		});
	}
}
