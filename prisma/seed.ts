import menuItems from '../data/menuItems.json';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const main = async () => {
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
