import { Controller, Get, Res } from '@nestjs/common'
import { Response } from 'express'
import * as client from 'prom-client'

@Controller('metrics')
export class MetricsController {
	@Get()
	async getMetrics(@Res() res: Response): Promise<void> {
		res.set('Content-Type', client.register.contentType)
		res.send(await client.register.metrics())
	}
}
