import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore, useWalletStore } from '@/lib/store';

const withdrawSchema = z.object({
  amount: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: 'Please enter a valid amount' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  upiId: z.string().min(5, { message: 'Please enter a valid UPI ID' }),
  mobile: z.string().regex(/^[0-9]{10}$/, { message: 'Mobile number must be 10 digits' }),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export function WithdrawForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { balance, addTransaction } = useWalletStore();
  const { toast } = useToast();
  
  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: '',
      name: user?.name || '',
      upiId: '',
      mobile: user?.mobile || '',
    },
  });
  
  const onSubmit = async (data: WithdrawFormValues) => {
    if (!user) return;
    
    const withdrawAmount = parseFloat(data.amount);
    
    // Check if the user has enough balance
    if (balance < withdrawAmount) {
      toast({
        variant: 'destructive',
        title: 'Insufficient balance',
        description: `You don't have enough funds to withdraw ₹${withdrawAmount.toFixed(2)}.`,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add transaction to wallet store
      addTransaction({
        userId: user.id,
        type: 'withdraw',
        amount: withdrawAmount,
        status: 'pending',
        description: `Withdrawal of ₹${withdrawAmount.toFixed(2)}`,
        details: {
          name: data.name,
          upiId: data.upiId,
        },
      });
      
      // Show success toast
      toast({
        title: 'Withdrawal request submitted',
        description: 'Your withdrawal will be processed by the admin shortly.',
      });
      
      // Reset form
      form.reset({
        amount: '',
        name: user.name,
        upiId: '',
        mobile: user.mobile,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Your withdrawal request could not be submitted. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Withdraw Funds</CardTitle>
        <CardDescription>Withdraw money to your UPI account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-primary/10">
          <AlertDescription>
            Your current balance: <span className="font-bold">₹{balance.toFixed(2)}</span>
          </AlertDescription>
        </Alert>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="100.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="upiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl>
                    <Input placeholder="yourname@upi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Alert>
              <AlertDescription>
                <strong>KYC is NOT required</strong> to withdraw funds.
              </AlertDescription>
            </Alert>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}