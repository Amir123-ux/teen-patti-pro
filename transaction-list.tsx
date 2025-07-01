import { format } from 'date-fns';
import { useWalletStore } from '@/lib/store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/types';

export function TransactionList() {
  const { transactions } = useWalletStore();
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions yet.</p>
      </div>
    );
  }
  
  const getStatusBadgeVariant = (status: Transaction['status']): "success" | "outline" | "destructive" | "default" => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'outline';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  const getTransactionTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600';
      case 'withdraw':
        return 'text-red-600';
      case 'ticket-purchase':
        return 'text-blue-600';
      case 'winning':
        return 'text-amber-600';
      default:
        return '';
    }
  };
  
  const formatAmount = (amount: number, type: Transaction['type']) => {
    return (type === 'deposit' || type === 'winning' ? '+' : '-') + 
           '₹' + amount.toFixed(2);
  };
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(transaction.timestamp), 'dd/MM/yyyy HH:mm')}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell className={`font-medium ${getTransactionTypeColor(transaction.type)}`}>
                {formatAmount(transaction.amount, transaction.type)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(transaction.status)}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}