import { IntersectionType } from '@nestjs/swagger';
import {
	ArrayMaxSize,
	IsArray,
	IsDate,
	IsIn,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';
import { UserResponse } from 'src/common/dto/user-response.dto';

export class RestaurantResponse {
	@IsDate()
	created_at: Date;

	@IsString()
	id: string;

	@IsString()
	name: string;

	@IsUrl()
	picture: string;

	@IsIn(['RESTAURANT'])
	role: string;

	@ArrayMaxSize(10)
	@IsArray()
	@IsString({ each: true })
	@MaxLength(15, { each: true })
	tags: string[];
}

export class MyRestaurantResponse extends IntersectionType(
	UserResponse,
	RestaurantResponse,
) {}
