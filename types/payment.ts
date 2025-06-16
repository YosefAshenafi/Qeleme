export interface PaymentPlan {
  _id: string;
  name: string;
  description: string;
  amount: number;
  durationInMonths: number;
  activeFrom: string;
  activeTo: string;
  remark: string;
  isActive: boolean;
  createdAt: string;
} 