import { APIRequestContext, expect, request, test } from '@playwright/test'
import { User } from '@app/shared/entities/user.entity'
import { Client } from 'pg'
import { CreateProductDTO, ProductDTO, UpdateProductDTO } from '@app/shared/types/dto/product.dto'

test.describe('API Customers', () => {
	let api: APIRequestContext
	const loginPayload = {
		email: `${new Date().getTime()}-product@epsi.net`,
		password: 'admin123',
	}
	let user: User | undefined
	let createdProduct: ProductDTO | undefined

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

		const pgClient = new Client({ connectionString: 'postgresql://user:password@localhost:5433/postgres' })
		await pgClient.connect()
		await pgClient.query('INSERT INTO user_roles (role_id, user_id, granted_by) VALUES ($1, $2, NULL)', [3, user.id])

		await renewToken()

		const storageState = await api.storageState()
		api = await request.newContext({
			baseURL: 'http://localhost:3002',
			storageState,
		})
	})

	test('POST /products - Create a new product', async () => {
		const createProductDTO: CreateProductDTO = {
			name: 'Bureau',
			details: {
				price: 299,
				description: 'Magnifique bureau',
				color: 'Marron',
			},
			stock: 5,
		}

		const result = await api.post('/products', {
			data: createProductDTO,
		})
		expect(result.status()).toBe(201)
		const body: ProductDTO = await result.json()
		expect(body.name).toBe('Bureau')
		expect(body.details).toStrictEqual({
			price: 299,
			description: 'Magnifique bureau',
			color: 'Marron',
		})
		expect(body.stock).toBe(5)

		createdProduct = body
	})

	test('GET /products - Get all products', async () => {
		const response = await api.get('/products')
		expect(response.status()).toBe(200)
		const body: ProductDTO[] = await response.json()
		expect(body).toBeInstanceOf(Array)
		expect(body.length).toBeGreaterThanOrEqual(1)
		expect(body.find((p) => p.id === createdProduct.id)).toBeDefined()
	})

	test('GET /products/:id - Get a product', async () => {
		const response = await api.get(`/products/${createdProduct.id}`)
		expect(response.status()).toBe(200)
		const body: ProductDTO = await response.json()
		expect(body.name).toBe('Bureau')
		expect(body.details).toStrictEqual({
			price: 299,
			description: 'Magnifique bureau',
			color: 'Marron',
		})
		expect(body.stock).toBe(5)
	})

	test('PUT /products - Update a product', async () => {
		const payload: UpdateProductDTO = {
			name: 'Chaise',
			stock: 3,
		}

		const result = await api.put(`/products/${createdProduct.id}`, {
			data: payload,
		})
		expect(result.status()).toBe(200)
		const body: ProductDTO = await result.json()
		expect(body.name).toBe('Chaise')
		expect(body.details).toStrictEqual({
			price: 299,
			description: 'Magnifique bureau',
			color: 'Marron',
		})
		expect(body.stock).toBe(3)
	})

	test('GET /products/:id - Verify Put action', async () => {
		const response = await api.get(`/products/${createdProduct.id}`)
		expect(response.status()).toBe(200)
		const body: ProductDTO = await response.json()
		expect(body.name).toBe('Chaise')
		expect(body.details).toStrictEqual({
			price: 299,
			description: 'Magnifique bureau',
			color: 'Marron',
		})
		expect(body.stock).toBe(3)
	})

	test('DELETE /products/:id - Should delete a product', async () => {
		const respnonse = await api.delete(`/products/${createdProduct.id}`)
		expect(respnonse.status()).toBe(200)

		// Verify it has been deleted
		const response = await api.get('/products')
		expect(response.status()).toBe(200)
		const body: ProductDTO[] = await response.json()
		expect(body).toBeInstanceOf(Array)
		expect(body.find((p) => p.id === createdProduct.id)).toBeUndefined()
	})
})
