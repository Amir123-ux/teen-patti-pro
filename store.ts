import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Transaction, Ticket, Winner, DrawResult } from './types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, mobile: string, password: string) => Promise<boolean>;
  logout: () => void;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransactionStatus: (id: string, status: Transaction['status']) => void;
}

interface TicketState {
  tickets: Ticket[];
  selectedNumbers: number[];
  toggleNumber: (num: number) => void;
  clearSelectedNumbers: () => void;
  buyTickets: () => Promise<boolean>;
  addTicket: (numbers: number[]) => void;
}

interface AdminState {
  pendingDeposits: Transaction[];
  pendingWithdrawals: Transaction[];
  users: User[];
  todayWinners: Winner[];
  drawResults: DrawResult[];
  approvePendingDeposit: (id: string) => void;
  approvePendingWithdrawal: (id: string) => void;
  rejectPendingTransaction: (id: string, type: 'deposit' | 'withdraw') => void;
  runDailyDraw: () => void;
}

// Mock data for testing
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    mobile: '9876543210',
    balance: 100
  },
  {
    id: 'admin',
    name: 'Admin User',
    email: 'admin@luckylottery.com',
    mobile: '9933308636',
    balance: 10000
  }
];

const MOCK_WINNERS: Winner[] = [
  {
    id: '1',
    userId: '3',
    userName: 'Rahul Sharma',
    ticketId: '101',
    numbers: [7, 12, 23, 35, 42],
    matchedNumbers: 5,
    prize: 10000000, // 1 Crore
    drawDate: new Date(Date.now() - 86400000) // Yesterday
  },
  {
    id: '2',
    userId: '4',
    userName: 'Priya Patel',
    ticketId: '102',
    numbers: [3, 18, 27, 31, 45],
    matchedNumbers: 4,
    prize: 1000000, // 10 Lakh
    drawDate: new Date(Date.now() - 86400000) // Yesterday
  }
];

// Create auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // Mock implementation
        const user = MOCK_USERS.find(u => u.email === email);
        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      register: async (name, email, mobile, password) => {
        // Mock implementation
        const newUser: User = {
          id: `user_${Date.now()}`,
          name,
          email,
          mobile,
          balance: 0
        };
        // In a real app, we would make an API call to register the user
        set({ user: newUser, isAuthenticated: true });
        return true;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      }
    }),
    { name: 'auth-store' }
  )
);

// Create wallet store
export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],
      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date()
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
          ...(transaction.status === 'completed' && transaction.type === 'deposit'
            ? { balance: state.balance + transaction.amount }
            : transaction.status === 'completed' && transaction.type === 'withdraw'
            ? { balance: state.balance - transaction.amount }
            : transaction.status === 'completed' && transaction.type === 'ticket-purchase'
            ? { balance: state.balance - transaction.amount }
            : transaction.status === 'completed' && transaction.type === 'winning'
            ? { balance: state.balance + transaction.amount }
            : {})
        }));
      },
      updateTransactionStatus: (id, status) => {
        set((state) => {
          const transaction = state.transactions.find(t => t.id === id);
          if (!transaction) return state;

          // Calculate new balance based on transaction type and new status
          let newBalance = state.balance;
          if (status === 'completed' && transaction.status !== 'completed') {
            if (transaction.type === 'deposit' || transaction.type === 'winning') {
              newBalance += transaction.amount;
            } else if (transaction.type === 'withdraw' || transaction.type === 'ticket-purchase') {
              newBalance -= transaction.amount;
            }
          } else if (status === 'rejected' && transaction.status === 'completed') {
            if (transaction.type === 'deposit' || transaction.type === 'winning') {
              newBalance -= transaction.amount;
            } else if (transaction.type === 'withdraw' || transaction.type === 'ticket-purchase') {
              newBalance += transaction.amount;
            }
          }

          const updatedTransactions = state.transactions.map(t => 
            t.id === id ? { ...t, status } : t
          );

          return {
            transactions: updatedTransactions,
            balance: newBalance
          };
        });
      }
    }),
    { name: 'wallet-store' }
  )
);

// Create tickets store
export const useTicketStore = create<TicketState>()(
  persist(
    (set, get) => ({
      tickets: [],
      selectedNumbers: [],
      toggleNumber: (num) => {
        set((state) => {
          const { selectedNumbers } = state;
          if (selectedNumbers.includes(num)) {
            return { selectedNumbers: selectedNumbers.filter(n => n !== num) };
          }
          // Only allow 5 selected numbers
          if (selectedNumbers.length < 5) {
            return { selectedNumbers: [...selectedNumbers, num] };
          }
          return state;
        });
      },
      clearSelectedNumbers: () => {
        set({ selectedNumbers: [] });
      },
      buyTickets: async () => {
        const { selectedNumbers } = get();
        if (selectedNumbers.length !== 5) return false;
        
        const authStore = useAuthStore.getState();
        const walletStore = useWalletStore.getState();
        
        if (!authStore.user) return false;
        
        // Check if user has enough balance
        if (walletStore.balance < 10) return false;
        
        // Create a transaction for this purchase
        walletStore.addTransaction({
          userId: authStore.user.id,
          type: 'ticket-purchase',
          amount: 10,
          status: 'completed',
          description: `Purchase of lottery ticket with numbers ${selectedNumbers.join(', ')}`
        });
        
        // Add the ticket
        get().addTicket(selectedNumbers);
        
        // Clear selected numbers after purchase
        get().clearSelectedNumbers();
        
        return true;
      },
      addTicket: (numbers) => {
        const authStore = useAuthStore.getState();
        if (!authStore.user) return;
        
        const ticket: Ticket = {
          id: `ticket_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          userId: authStore.user.id,
          numbers: [...numbers],
          purchaseDate: new Date(),
          drawDate: new Date(Date.now() + 86400000), // Next day draw
          status: 'active'
        };
        
        set((state) => ({
          tickets: [ticket, ...state.tickets]
        }));
      }
    }),
    { name: 'ticket-store' }
  )
);

// Create admin store
export const useAdminStore = create<AdminState>()(
  (set, get) => ({
    pendingDeposits: [],
    pendingWithdrawals: [],
    users: MOCK_USERS,
    todayWinners: MOCK_WINNERS,
    drawResults: [],
    approvePendingDeposit: (id) => {
      const walletStore = useWalletStore.getState();
      walletStore.updateTransactionStatus(id, 'completed');
      
      set((state) => ({
        pendingDeposits: state.pendingDeposits.filter(d => d.id !== id)
      }));
    },
    approvePendingWithdrawal: (id) => {
      const walletStore = useWalletStore.getState();
      walletStore.updateTransactionStatus(id, 'completed');
      
      set((state) => ({
        pendingWithdrawals: state.pendingWithdrawals.filter(w => w.id !== id)
      }));
    },
    rejectPendingTransaction: (id, type) => {
      const walletStore = useWalletStore.getState();
      walletStore.updateTransactionStatus(id, 'rejected');
      
      if (type === 'deposit') {
        set((state) => ({
          pendingDeposits: state.pendingDeposits.filter(d => d.id !== id)
        }));
      } else {
        set((state) => ({
          pendingWithdrawals: state.pendingWithdrawals.filter(w => w.id !== id)
        }));
      }
    },
    runDailyDraw: () => {
      // Generate 5 random numbers between 0 and 49
      const winningNumbers: number[] = [];
      while (winningNumbers.length < 5) {
        const num = Math.floor(Math.random() * 50);
        if (!winningNumbers.includes(num)) {
          winningNumbers.push(num);
        }
      }
      
      // Create draw result
      const drawResult: DrawResult = {
        id: `draw_${Date.now()}`,
        numbers: winningNumbers,
        drawDate: new Date(),
        winners: [
          { matchCount: 5, count: 0, prize: 10000000 }, // 1 Crore
          { matchCount: 4, count: 0, prize: 1000000 },  // 10 Lakh
          { matchCount: 3, count: 0, prize: 600000 },   // 6 Lakh
          { matchCount: 2, count: 0, prize: 500 },      // 500
          { matchCount: 1, count: 0, prize: 100 }       // 100
        ]
      };
      
      // Update all active tickets
      const ticketStore = useTicketStore.getState();
      const walletStore = useWalletStore.getState();
      
      const newTickets = ticketStore.tickets.map(ticket => {
        if (ticket.status !== 'active') return ticket;
        
        // Count matching numbers
        const matchedNumbers = ticket.numbers.filter(num => winningNumbers.includes(num)).length;
        let prize = 0;
        
        // Determine prize based on matches
        switch (matchedNumbers) {
          case 5: prize = 10000000; break; // 1 Crore
          case 4: prize = 1000000; break;  // 10 Lakh
          case 3: prize = 600000; break;   // 6 Lakh
          case 2: prize = 500; break;      // 500
          case 1: prize = 100; break;      // 100
          default: prize = 0;
        }
        
        if (prize > 0) {
          // Update draw result winner counts
          drawResult.winners.find(w => w.matchCount === matchedNumbers)!.count++;
          
          // Create winning transaction
          if (ticket.userId) {
            walletStore.addTransaction({
              userId: ticket.userId,
              type: 'winning',
              amount: prize,
              status: 'completed',
              description: `Won ₹${prize.toLocaleString('en-IN')} with ${matchedNumbers} matching numbers`
            });
            
            // Add to winners
            const user = get().users.find(u => u.id === ticket.userId);
            if (user) {
              const winner: Winner = {
                id: `winner_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                userId: ticket.userId,
                userName: user.name,
                ticketId: ticket.id,
                numbers: ticket.numbers,
                matchedNumbers,
                prize,
                drawDate: new Date()
              };
              
              set((state) => ({
                todayWinners: [winner, ...state.todayWinners]
              }));
            }
          }
          
          return {
            ...ticket,
            status: 'won',
            matchedNumbers,
            prize
          };
        } else {
          return {
            ...ticket,
            status: 'lost',
            matchedNumbers
          };
        }
      });
      
      // Update tickets in store
      ticketStore.tickets = newTickets;
      
      // Save draw result
      set((state) => ({
        drawResults: [drawResult, ...state.drawResults]
      }));
    }
  })
);