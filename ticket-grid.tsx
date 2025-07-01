import { Ticket } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TicketGridProps {
  tickets: Ticket[];
}

export function TicketGrid({ tickets }: TicketGridProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You haven't purchased any tickets yet.</p>
      </div>
    );
  }
  
  const getStatusBadge = (ticket: Ticket) => {
    switch (ticket.status) {
      case 'active':
        return <Badge variant="outline">Active</Badge>;
      case 'drawn':
        return <Badge variant="secondary">Drawn</Badge>;
      case 'won':
        return <Badge variant="default">Winner</Badge>;
      case 'lost':
        return <Badge variant="destructive">No Win</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                Ticket #{ticket.id.substring(ticket.id.lastIndexOf('_') + 1)}
              </CardTitle>
              {getStatusBadge(ticket)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-1 mb-3">
              {ticket.numbers.map((num) => (
                <div 
                  key={num}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-white font-medium"
                >
                  {num}
                </div>
              ))}
            </div>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Purchase Date:</span>{' '}
                {format(new Date(ticket.purchaseDate), 'dd/MM/yyyy')}
              </p>
              <p>
                <span className="text-muted-foreground">Draw Date:</span>{' '}
                {format(new Date(ticket.drawDate), 'dd/MM/yyyy')}
              </p>
              {ticket.status === 'won' && (
                <p className="font-medium text-green-600">
                  Won ₹{ticket.prize?.toLocaleString('en-IN')}
                </p>
              )}
              {ticket.matchedNumbers !== undefined && ticket.status !== 'active' && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Matched Numbers:</span>{' '}
                  {ticket.matchedNumbers}
                </p>
              )}
            </div>
          </CardContent>
          {ticket.status === 'active' && (
            <CardFooter className="pt-0">
              <p className="text-xs text-muted-foreground">
                Results will be announced after the draw
              </p>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}