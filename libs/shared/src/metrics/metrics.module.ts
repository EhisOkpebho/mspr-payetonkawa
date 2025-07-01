import { Global, Module } from '@nestjs/common'
import { PrometheusModule } from '@willsoto/nestjs-prometheus'
import { MetricsController } from './metrics.controller'
import { httpRequestDurationProviders } from './metrics.providers'

@Global()
@Module({
	imports: [
		PrometheusModule.register({
			defaultMetrics: {
				enabled: true,
			},
		}),
	],
	controllers: [MetricsController],
	providers: [...httpRequestDurationProviders],
	exports: [...httpRequestDurationProviders, PrometheusModule],
})
export class MetricsModule {}
