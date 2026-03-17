export interface PowerEstimateInput {
  durationMinutes: number;
  averageWattage?: number;
}

export class PowerService {
  estimateKwh(input: PowerEstimateInput): number {
    const averageWattage = input.averageWattage ?? 120;
    const hours = input.durationMinutes / 60;
    return Number(((averageWattage * hours) / 1000).toFixed(4));
  }
}
