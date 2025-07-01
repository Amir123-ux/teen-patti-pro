export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  balance: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'ticket-purchase' | 'winning';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  timestamp: Date;
  description: string;
  details?: {
    transactionId?: string;
    upiId?: string;
    name?: string;
    screenshot?: string;
  };
}

export interface Ticket {
  id: string;
  userId: string;
  numbers: number[];
  purchaseDate: Date;
  drawDate: Date;
  status: 'active' | 'drawn' | 'won' | 'lost';
  matchedNumbers?: number;
  prize?: number;
}

export interface Winner {
  id: string;
  userId: string;
  userName: string;
  ticketId: string;
  numbers: number[];
  matchedNumbers: number;
  prize: number;
  drawDate: Date;
}

export interface DrawResult {
  id: string;
  numbers: number[];
  drawDate: Date;
  winners: {
    matchCount: number;
    count: number;
    prize: number;
  }[];
}

export interface PrizeStructure {
  match: number;
  prize: number | string;
  description: string;
}