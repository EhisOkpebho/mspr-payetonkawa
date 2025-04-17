import { Injectable } from '@nestjs/common'

@Injectable()
export class ApiCustomersService {
	getHello(): string {
		return 'Clients API'
	}
}
