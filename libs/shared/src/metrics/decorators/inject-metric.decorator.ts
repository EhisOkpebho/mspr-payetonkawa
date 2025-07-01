import { Inject } from '@nestjs/common'

export const InjectMetric = (name: string) => Inject(`PROM_METRIC_${name}`)
