import { Histogram } from 'prom-client';

export const HTTP_REQUEST_DURATION_METRIC_NAME = 'HTTP_REQUEST_DURATION_SECONDS';

export const httpRequestDurationProviders = [
	{
		provide: `PROM_METRIC_${HTTP_REQUEST_DURATION_METRIC_NAME}`,
		useValue: new Histogram({
			name: HTTP_REQUEST_DURATION_METRIC_NAME.toLowerCase(),
			help: 'Duration of HTTP requests in seconds',
			labelNames: ['method', 'route', 'status'] as const,
			buckets: [0.1, 0.5, 1, 2, 5],
		}),
	},
];