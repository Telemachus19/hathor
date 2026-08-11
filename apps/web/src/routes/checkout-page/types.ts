export type PaymentTab = 'credit_card' | 'paypal' | 'simulated';
export type SimulatedPaymentMethod = 'sim_fawry' | 'sim_vodafone_cash' | 'sim_instapay';

export interface CheckoutMappedItem {
  gameId: string;
  alreadyOwned: boolean;
  title: string;
  genre: string;
  coverUrl: string | null;
  priceEgp: string;
}

export interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  subscribeAlerts: boolean;
}

export interface CardDetails {
  cardNumber: string;
  nameOnCard: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}
