import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MenuItemsService {
	constructor(private readonly prismaService: PrismaService) {}

	// async create(menuItemCreateInput: Prisma.MenuItemCreateInput) {
	// 	return this.prismaService.menuItem.create({
	// 		data: menuItemCreateInput,
	// 	});
	// }
}
