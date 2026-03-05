import {
	ArrayMaxSize,
	IsArray,
	IsDate,
	IsIn,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';
import { ROLES } from 'src/common/constants/roles';

export class RestaurantResponse {
	@IsDate()
	created_at: Date;

	@IsString()
	id: string;

	@IsString()
	name: string;

	@IsUrl()
	picture: string;

	@IsIn([ROLES.RESTAURANT.slice(3)])
	role: string;

	@ArrayMaxSize(10)
	@IsArray()
	@IsString({ each: true })
	@MaxLength(15, { each: true })
	tags: string[];
}
