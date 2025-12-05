import { PrismaClient } from 'src/shared/utils/prisma';
import menuItems from '../data/menuItems.json';
import restaurants from '../data/restaurants.json';
const prisma = new PrismaClient();

const main = async () => {
	console.log('Following restaurants are created:');

	for (const { id, name, tags } of restaurants) {
		const result = await prisma.restaurant.create({
			data: { id, name, tags },
		});

		console.log(result);
	}

	console.log('Following menu-items are created:');

	for (const menuItem of menuItems) {
		const result = await prisma.menuItem.create({
			data: { ...menuItem, category: 'DISH' },
		});

		console.log(result);
	}
};

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
