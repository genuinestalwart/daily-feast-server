import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsPositive } from 'class-validator';

enum Action {
	decrement = 'decrement',
	increment = 'increment',
}

export class UpdateAmountBody {
	@ApiProperty({ enum: Action })
	@IsEnum(Action)
	action: Action;

	@IsInt()
	@IsPositive()
	amount: number;
}
