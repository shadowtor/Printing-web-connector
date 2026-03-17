export interface StockSignal {
  materialType: string;
  color?: string | null;
  estimatedRemaining: number;
  threshold: number;
  isLow: boolean;
}
