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
import { UserID } from 'src/common/decorators/user-id.decorator';
import { CheckRoles } from 'src/common/decorators/check-roles.decorator';
import { ROLES } from 'src/common/constants/roles';
import {
	ApiAddToCartResponses,
	ApiClearCartResponses,
	ApiGetCartItemsResponses,
	ApiRemoveCartItemResponses,
	ApiUpdateCartItemResponses,
} from 'src/common/decorators/api/cart-item.decorator';

@CheckRoles(ROLES.CUSTOMER)
@Controller('cart')
export class CartItemsController {
	constructor(private readonly cartItemsService: CartItemsService) {}

	@ApiAddToCartResponses()
	@Post()
	async addToCart(@Body() dto: AddToCartBody, @UserID() userID: string) {
		return this.cartItemsService.addToCart(userID, dto);
	}

	@ApiGetCartItemsResponses()
	@Get()
	async getCartItems(@UserID() userID: string) {
		return this.cartItemsService.getCartItems(userID);
	}

	@ApiUpdateCartItemResponses()
	@Patch(':id')
	async updateAmount(
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body() dto: UpdateAmountBody,
		@UserID() userID: string,
	) {
		return this.cartItemsService.updateAmount(userID, id, dto);
	}

	@ApiRemoveCartItemResponses()
	@Delete(':id')
	@HttpCode(204)
	async removeFromCart(
		@Param('id', new ParseUUIDPipe()) id: string,
		@UserID() userID: string,
	) {
		return this.cartItemsService.removeFromCart(userID, id);
	}

	@ApiClearCartResponses()
	@Delete()
	@HttpCode(204)
	async clearCart(@UserID() userID: string) {
		return this.cartItemsService.clearCart(userID);
	}
}
