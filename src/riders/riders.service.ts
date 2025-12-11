import { Injectable } from '@nestjs/common';
import { UpdateRiderBody } from './dto/update-rider-body.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Auth0Service } from 'src/auth0/auth0.service';
import { ROLES } from 'src/common/constants/roles';
import { UsersService } from 'src/common/services/users.service';

@Injectable()
export class RidersService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
		private readonly usersService: UsersService,
	) {}

	async getRider(id: string) {
		return this.usersService.getUser(id, ROLES.RIDER);
	}

	async updateRider(id: string, dto: UpdateRiderBody) {
		await this.auth0Service.users.update(id, dto);
		return this.getRider(id);
	}

	async deleteRider(id: string) {
		const cleanUp = async () => {
			const orders = await this.prismaService.order.updateManyAndReturn({
				data: { rider_id: null },
				select: { status: true, total_price: true },
				where: { rider_id: id },
			});

			return { orders };
		};

		return this.usersService.deleteUser(
			id,
			{ rider_id: id, status: { in: ['PICKED_UP', 'IN_TRANSIT'] } },
			cleanUp,
		);
	}
}
