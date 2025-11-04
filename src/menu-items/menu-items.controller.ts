import { Controller, Post, Body } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDTO } from './dto/create-menu-item.dto';

@Controller('menu-items')
export class MenuItemsController {
	constructor(private readonly menuItemsService: MenuItemsService) {}

	// @Post()
	// create(@Body() createMenuItemDTO: CreateMenuItemDTO) {
	// 	return this.menuItemsService.create(createMenuItemDTO);
	// }
}
