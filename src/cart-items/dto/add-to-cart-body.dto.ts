import { IsUUID } from 'class-validator';
import { TrimString } from 'src/common/decorators/trim-string.decorator';

export class AddToCartBody {
	@IsUUID()
	@TrimString()
	menu_item_id: string;
}
