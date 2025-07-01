import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { NumberSelector } from '@/components/tickets/number-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore, useTicketStore, useWalletStore } from '@/lib/store';

export default function BuyTicketsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { selectedNumbers, buyTickets } = useTicketStore();
  const { balance } = useWalletStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleBuyTicket = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (selectedNumbers.length !== 5) {
      toast({
        variant: 'destructive',
        title: 'Incomplete selection',
        description: 'Please select exactly 5 numbers to buy a ticket.',
      });
      return;
    }
    
    if (balance < 10) {
      toast({
        variant: 'destructive',
        title: 'Insufficient balance',
        description: 'Please add funds to your wallet to buy tickets.',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await buyTickets();
      
      if (success) {
        toast({
          title: 'Ticket purchased successfully!',
          description: 'Good luck! Results will be announced after the draw.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Purchase failed',
          description: 'Could not purchase ticket. Please try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'An error occurred while purchasing your ticket.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Buy Lottery Tickets</h1>
            <p className="text-muted-foreground">
              Select 5 numbers from 0 to 49 to create your ticket
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Pick Your Lucky Numbers</CardTitle>
              <CardDescription>Click on 5 numbers below</CardDescription>
            </CardHeader>
            <CardContent>
              <NumberSelector />
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div>
                <p className="text-sm font-medium">Price per ticket: ₹10</p>
                {isAuthenticated && (
                  <p className="text-xs text-muted-foreground">Your balance: ₹{balance.toFixed(2)}</p>
                )}
              </div>
              <Button
                onClick={handleBuyTicket}
                disabled={selectedNumbers.length !== 5 || isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Buy Ticket (₹10)'}
              </Button>
            </CardFooter>
          </Card>
          
          {!isAuthenticated && (
            <Alert>
              <AlertTitle>You need to be logged in to buy tickets</AlertTitle>
              <AlertDescription>
                Please <Link to="/login" className="underline">login</Link> or <Link to="/register" className="underline">create an account</Link> to continue.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Prize Structure</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Match 5 numbers:</span>
                <span className="font-medium">₹1 Crore (1st Prize)</span>
              </li>
              <li className="flex justify-between">
                <span>Match 4 numbers:</span>
                <span className="font-medium">₹10 Lakh (2nd Prize)</span>
              </li>
              <li className="flex justify-between">
                <span>Match 3 numbers:</span>
                <span className="font-medium">₹6 Lakh (3rd Prize)</span>
              </li>
              <li className="flex justify-between">
                <span>Match 2 numbers:</span>
                <span className="font-medium">₹500 (4th Prize)</span>
              </li>
              <li className="flex justify-between">
                <span>Match 1 number:</span>
                <span className="font-medium">₹100 (5th Prize)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}