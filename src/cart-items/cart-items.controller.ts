import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseUUIDPipe,
	HttpCode,
} from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { AddToCartBody } from './dto/add-to-cart-body.dto';
import { UpdateAmountBody } from './dto/update-amount-body.dto';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { ROLES } from 'src/common/constants/roles';
import {
	ApiAddToCartResponses,
	ApiClearCartResponses,
	ApiGetCartItemsResponses,
	ApiRemoveFromCartResponses,
	ApiUpdateAmountResponses,
} from 'src/common/decorators/api/cart-item.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/auth-user.type';

@HasRoles(ROLES.CUSTOMER)
@Controller('cart')
export class CartItemsController {
	constructor(private readonly cartItemsService: CartItemsService) {}

	@ApiAddToCartResponses()
	@Post()
	async addToCart(
		@CurrentUser() currentUser: AuthUser,
		@Body() dto: AddToCartBody,
	) {
		return this.cartItemsService.addToCart(currentUser.id, dto);
	}

	@ApiGetCartItemsResponses()
	@Get()
	async getCartItems(@CurrentUser() currentUser: AuthUser) {
		return this.cartItemsService.getCartItems(currentUser.id);
	}

	@ApiUpdateAmountResponses()
	@Patch(':id')
	async updateAmount(
		@CurrentUser() currentUser: AuthUser,
		@Body() dto: UpdateAmountBody,
		@Param('id', new ParseUUIDPipe()) id: string,
	) {
		return this.cartItemsService.updateAmount(currentUser.id, dto, id);
	}

	@ApiRemoveFromCartResponses()
	@Delete(':id')
	@HttpCode(204)
	async removeFromCart(
		@CurrentUser() currentUser: AuthUser,
		@Param('id', new ParseUUIDPipe()) id: string,
	) {
		return this.cartItemsService.removeFromCart(currentUser.id, id);
	}

	@ApiClearCartResponses()
	@Delete()
	@HttpCode(204)
	async clearCart(@CurrentUser() currentUser: AuthUser) {
		return this.cartItemsService.clearCart(currentUser.id);
	}
}
