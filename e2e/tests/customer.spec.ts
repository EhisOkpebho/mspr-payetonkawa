import { APIRequestContext, expect, request, test } from '@playwright/test'
import { CreateCustomerDTO, CustomerDTO } from '@app/shared/types/dto/customer.dto'
import { User } from '@app/shared/entities/user.entity'
import { Client } from 'pg'

test.describe('API Customers', () => {
	let api: APIRequestContext
	const loginPayload = {
		email: `${new Date().getTime()}-user@epsi.net`,
		password: 'admin123',
	}
	let user: User | undefined

	test.beforeAll(async () => {
		api = await request.newContext({
			baseURL: 'http://localhost:3000',
		})

		// We create a new user
		const registerResponse = await api.post('/auth/register', {
			data: loginPayload,
		})
		expect(registerResponse.status()).toBe(201)

		// We login to get a token (through cookies)
		const loginResponse = await api.post('/auth/login', {
			data: loginPayload,
		})
		expect(loginResponse.status()).toBe(201)
	})

	test('POST /customers - Register a new customer', async () => {
		const createCustomerDTO: CreateCustomerDTO = {
			name: 'DOE',
			username: 'JohnDoe123',
			firstName: 'John',
			lastName: 'DOE',
			address: {
				postalCode: '59000',
				city: 'Lille',
			},
			profile: {
				username: 'JohnDoe123',
				firstName: 'John',
				lastName: 'Doe',
			},
			company: {
				companyName: 'EPSI',
			},
		}

		const result = await api.post('/customers', {
			data: createCustomerDTO,
		})
		expect(result.status()).toBe(201)
		const body: CustomerDTO = await result.json()
		expect(body.address).toStrictEqual({
			city: 'Lille',
			postalCode: '59000',
		})
		expect(body.company).toStrictEqual({
			companyName: 'EPSI',
		})
		expect(body.firstName).toBe('John')
		expect(body.lastName).toBe('DOE')
		expect(body.name).toBe('DOE')
		expect(body.profile).toStrictEqual({
			firstName: 'John',
			lastName: 'DOE',
		})
		expect(body.username).toBe('JohnDoe123')
	})

	async function renewToken() {
		const logoutResponse = await api.post('/auth/logout')
		expect(logoutResponse.status()).toBe(200)

		const loginResponse = await api.post('/auth/login', { data: loginPayload })
		expect(loginResponse.status()).toBe(201)
	}

	test('POST /auth/log{in|out} - Logout then login to renew token (new customer added)', renewToken)

	test('GET /auth/me - User must be linked to customer', async () => {
		const meResponse = await api.get('/auth/me')
		expect(meResponse.status()).toBe(200)
		const body = await meResponse.json()
		expect(body.customer.name).toBe('DOE')
		expect(body.customer.username).toBe('JohnDoe123')
		expect(body.customer.firstName).toBe('John')
		expect(body.customer.lastName).toBe('DOE')
		expect(body.customer.postalCode).toBe('59000')
		expect(body.customer.city).toBe('Lille')
		expect(body.customer.companyName).toBe('EPSI')

		user = body
	})

	test('PUT /customers/:id - Should update user', async () => {
		const response = await api.put(`/customers/${user.customer.id}`)
		expect(response.status()).toBe(200)

		const body = await response.json()
		expect(body.id).toBe(user.customer.id)
		expect(body.name).toBe('DOE')
		expect(body.username).toBe('JohnDoe123')
		expect(body.firstName).toBe('John')
		expect(body.lastName).toBe('DOE')
		expect(body.address).toStrictEqual({ postalCode: '59000', city: 'Lille' })
		expect(body.profile).toStrictEqual({ firstName: 'John', lastName: 'DOE' })
		expect(body.company).toStrictEqual({ companyName: 'EPSI' })
	})

	test('GET /customers - Should throw forbidden exception (Not admin)', async () => {
		const response = await api.get('/customers')
		expect(response.status()).toBe(403)
	})

	test('GET /customers/:id - Should throw forbidden exception (Not admin)', async () => {
		const response = await api.get(`/customers/${user.customer.id + 1}`)
		expect(response.status()).toBe(403)
	})

	test('DELETE /customers/:id - Should throw forbidden if user to delete is not the one logged in', async () => {
		const response = await api.delete(`/customers/${user.customer.id + 1}`)
		expect(response.status()).toBe(403)
	})

	test('Changing role from CUSTOMER to ADMIN', async () => {
		const pgClient = new Client({ connectionString: 'postgresql://user:password@localhost:5433/postgres' })
		await pgClient.connect()
		await pgClient.query('UPDATE user_roles SET role_id = $1 WHERE user_id = $2', [3, user.id])
	})

	test('GET /customers - Should return all customers', async () => {
		const response = await api.get('/customers')
		expect(response.status()).toBe(200)
		const body = await response.json()
		expect(body).toBeInstanceOf(Array)
		expect(body.length).toBeGreaterThanOrEqual(1)
	})

	test('GET /customers/:id - Should return a customer by its id', async () => {
		const response = await api.get(`/customers/${user.customer.id}`)
		expect(response.status()).toBe(200)
		const body = await response.json()
		expect(body.username).toBe('JohnDoe123')
	})
})
