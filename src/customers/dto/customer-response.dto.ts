import { ArrayNotEmpty, IsArray, IsIn } from 'class-validator';
import { UserResponse } from 'src/common/dto/user-response.dto';

export class CustomerResponse extends UserResponse {
	@IsArray()
	@ArrayNotEmpty()
	identities: any[];

	@IsIn(['CUSTOMER'])
	role: string;
}
