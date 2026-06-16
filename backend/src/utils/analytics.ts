export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function calculateGrowthRate(
  currentValue: number,
  previousValue: number
): number {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return Math.round(((currentValue - previousValue) / previousValue) * 100);
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((valueA, valueB) => valueA - valueB);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

export function calculateSum(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

export function calculateConversionRate(
  converted: number,
  total: number
): number {
  return calculatePercentage(converted, total);
}

export function generateMonthlySeries(
  data: any[],
  dateField: string,
  valueField: string,
  monthsBack: number = 11
): { month: string; value: number }[] {
  const monthLabels: string[] = [];
  const now = new Date();

  for (let monthOffset = monthsBack; monthOffset >= 0; monthOffset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    monthLabels.push(date.toISOString().slice(0, 7));
  }

  return monthLabels.map((month) => ({
    month: month.slice(5),
    value: data
      .filter(
        (item) =>
          item[dateField] && item[dateField].startsWith(month)
      )
      .reduce(
        (sum: number, item: any) => sum + (item[valueField] || 0),
        0
      ),
  }));
}
