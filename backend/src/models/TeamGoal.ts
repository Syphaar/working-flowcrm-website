export interface TeamGoal {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  metric: string;
  period: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
