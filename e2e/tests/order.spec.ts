import { APIRequestContext, expect, request, test } from '@playwright/test'
import { User } from '@app/shared/entities/user.entity'
import { Client } from 'pg'
import { CreateOrderDto } from '@app/shared/types/dto/order.dto'
import { Order } from '@app/shared/entities/order.entity'
import { ProductDTO } from '@app/shared/types/dto/product.dto'

test.describe('API Customers', () => {
	let api: APIRequestContext
	const loginPayload = {
		email: `${new Date().getTime()}-order@epsi.net`,
		password: 'admin123',
	}
	let user: User | undefined
	let createdProductId: number | undefined
	let createdOrder: Order | undefined

	async function renewToken() {
		const logoutResponse = await api.post('/auth/logout')
		expect(logoutResponse.status()).toBe(200)

		const loginResponse = await api.post('/auth/login', { data: loginPayload })
		expect(loginResponse.status()).toBe(201)
	}

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

		const meResponse = await api.get('/auth/me')
		expect(meResponse.status()).toBe(200)
		const body = await meResponse.json()
		user = body

		const customersPgClient = new Client({ connectionString: 'postgresql://user:password@localhost:5433/postgres' })
		await customersPgClient.connect()
		await customersPgClient.query('INSERT INTO user_roles (role_id, user_id, granted_by) VALUES ($1, $2, NULL)', [3, user.id])

		await renewToken()

		const productsPgClient = new Client({ connectionString: 'postgresql://user:password@localhost:5435/postgres' })
		await productsPgClient.connect()
		createdProductId = (
			await productsPgClient.query(
				'INSERT INTO product (name, price, description, color, stock) VALUES ($1, $2, $3, $4, $5) RETURNING id',
				['Chaise', 50, 'Super chaise', 'Bleu', 5],
			)
		).rows[0].id

		api = await request.newContext({
			baseURL: 'http://localhost:3001',
			storageState: await api.storageState(),
		})
	})

	test('GET /orders - Should get orders', async () => {
		const response = await api.get('/orders')
		expect(response.status()).toBe(200)
		const body = await response.json()
		expect(body).toBeInstanceOf(Array)
	})

	test('POST /orders - Create throw 403 (user has no linked customer)', async () => {
		const orderCreateDto: CreateOrderDto = {
			productId: createdProductId,
			quantity: 3,
		}

		const response = await api.post('/orders', {
			data: orderCreateDto,
		})
		expect(response.status()).toBe(403)
	})

	test('POST /orders - Create a new order', async () => {
		api = await request.newContext({
			baseURL: 'http://localhost:3000',
			storageState: await api.storageState(),
		})
		const customerResponse = await api.post('/customers', {
			data: {
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
			},
		})
		expect(customerResponse.status()).toBe(201)
		await renewToken()

		const meResponse = await api.get('/auth/me')
		expect(meResponse.status()).toBe(200)
		const body = await meResponse.json()
		user = body

		api = await request.newContext({
			baseURL: 'http://localhost:3001',
			storageState: await api.storageState(),
		})

		const orderCreateDto: CreateOrderDto = {
			productId: createdProductId,
			quantity: 3,
		}

		const response = await api.post('/orders', {
			data: orderCreateDto,
		})
		expect(response.status()).toBe(201)
		expect(await response.body()).toBeInstanceOf(Buffer)
		expect((await response.body()).length).toBeGreaterThan(100)
	})

	test('GET /orders - Should get orders and check other order has been added', async () => {
		const response = await api.get('/orders')
		expect(response.status()).toBe(200)
		const body = await response.json()
		expect(body).toBeInstanceOf(Array)
		createdOrder = body.find((o) => o.customerId === user.customer.id)
		expect(createdOrder).toBeDefined()
		expect(createdOrder.productId).toBe(createdProductId)
		expect(createdOrder.quantity).toBe(3)
	})

	test('GET /orders/:id - Should get order by its id', async () => {
		const response = await api.get(`/orders/${createdOrder.id}`)
		expect(response.status()).toBe(200)
		const body = await response.json()
		expect(body.productId).toBe(createdProductId)
		expect(body.quantity).toBe(3)
	})

	test('GET /products/:id - Stock should have decreased', async () => {
		api = await request.newContext({
			baseURL: 'http://localhost:3002',
			storageState: await api.storageState(),
		})

		const response = await api.get(`/products/${createdProductId}`)
		expect(response.status()).toBe(200)
		const body: ProductDTO = await response.json()
		expect(body.id).toBe(createdProductId)
		expect(body.name).toBe('Chaise')
		expect(body.details.description).toBe('Super chaise')
		expect(body.details.price).toBe(50)
		expect(body.details.color).toBe('Bleu')
		expect(body.stock).toBe(2)
	})

	test('GET /orders/me - Should get orders and check other order has been added', async () => {
		api = await request.newContext({
			baseURL: 'http://localhost:3001',
			storageState: await api.storageState(),
		})

		const response = await api.get('/orders/me')
		expect(response.status()).toBe(200)
		const body = await response.json()
		expect(body).toBeInstanceOf(Array)
		expect(body.length).toBe(1)
		createdOrder = body.find((o) => o.customerId === user.customer.id)
		expect(createdOrder).toBeDefined()
		expect(createdOrder.productId).toBe(createdProductId)
		expect(createdOrder.quantity).toBe(3)
	})
})
