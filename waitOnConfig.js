module.exports = {
	resources: ['http://localhost:3000/customers', 'http://localhost:3001/orders', 'http://localhost:3002/products'],
	validateStatus: function (status) {
		return (status >= 200 && status < 300) || status === 403
	},
	timeout: 30000,
	interval: 500,
}
