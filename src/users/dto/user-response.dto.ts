import {
	ArrayMaxSize,
	ArrayNotEmpty,
	IsArray,
	IsBoolean,
	IsDate,
	IsEmail,
	IsIn,
	IsInt,
	IsNumber,
	IsString,
	IsUrl,
	MaxLength,
	Min,
} from 'class-validator';
import { ROLES } from 'src/common/constants/roles';

class UserResponse {
	@IsDate()
	created_at: Date;

	@IsEmail()
	email: string;

	@IsBoolean()
	email_verified: boolean;

	@IsString()
	id: string;

	@IsArray()
	@ArrayNotEmpty()
	identities: any[];

	@IsString()
	name: string;

	@IsUrl()
	picture: string;

	@IsDate()
	updated_at: Date;
}

export class MyCustomerResponse extends UserResponse {
	@IsIn([ROLES.CUSTOMER.slice(3)])
	role: string;
}

export class MyRestaurantResponse extends UserResponse {
	@IsIn([ROLES.RESTAURANT.slice(3)])
	role: string;

	@ArrayMaxSize(10)
	@IsArray()
	@IsString({ each: true })
	@MaxLength(15, { each: true })
	tags: string[];
}

export class MyRiderResponse extends UserResponse {
	@IsIn([ROLES.RIDER.slice(3)])
	role: string;
}

class DeleteUserResponse {
	@IsInt()
	@Min(0)
	failedOrders: number;

	@IsInt()
	@Min(0)
	successfulOrders: number;

	@IsNumber()
	@Min(0)
	totalOrders: number;
}

export class DeleteCustomerResponse extends DeleteUserResponse {
	@IsInt()
	@Min(0)
	cancelledOrders: number;

	@IsNumber()
	@Min(0)
	grandTotalPrice: number;
}
export class DeleteRestaurantResponse extends DeleteUserResponse {
	@IsNumber()
	@Min(0)
	grandTotalPrice: number;

	@IsInt()
	@Min(0)
	menuItems: number;

	@IsInt()
	@Min(0)
	rejectedOrders: number;
}

export class DeleteRiderResponse extends DeleteUserResponse {}
