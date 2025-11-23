import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { UpdateRiderDTO } from './dto/update-rider.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Auth0Service } from 'src/auth0/auth0.service';
import { ROLES } from 'src/shared/constants/roles';

@Injectable()
export class RidersService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
	) {}

	async getRider(id: string) {
		const rider = await this.auth0Service.users.get(id);
		const { data } = await this.auth0Service.users.roles.list(id);

		// Not having the RIDER role means the user doesn't exist as a rider
		if (!data.map((role) => role.name).includes(ROLES.RIDER)) {
			throw new NotFoundException();
		}

		return {
			created_at: rider.created_at,
			email: rider.email,
			email_verified: rider.email_verified,
			id: rider.user_id,
			identities: rider.identities,
			name: rider.name,
			picture: rider.picture,
			role: 'RIDER',
			updated_at: rider.updated_at,
		};
	}

	async updateRider(id: string, dto: UpdateRiderDTO) {
		return this.auth0Service.users.update(id, dto);
	}

	async deleteRider(id: string) {
		// Rider can't be deleted if an order is still ongoing
		const activeOrders = await this.prismaService.order.count({
			where: {
				rider_id: id,
				status: { in: ['PICKED_UP', 'IN_TRANSIT'] },
			},
		});

		if (activeOrders) {
			throw new ConflictException();
		}

		const orders = await this.prismaService.order.updateManyAndReturn({
			data: { rider_id: null },
			select: { status: true },
			where: { rider_id: id },
		});

		await this.auth0Service.users.delete(id);

		return {
			failedOrders: orders.filter((order) => order.status === 'FAILED')
				.length,
			successfulOrders: orders.filter(
				(order) => order.status === 'DELIVERED',
			).length,
			totalOrders: orders.length,
		};
	}
}
