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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRCode } from '@/components/ui/qr-code';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore, useWalletStore } from '@/lib/store';

const depositSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: 'Please enter a valid amount' }),
  transactionId: z.string().min(4, { message: 'Transaction ID must be at least 4 characters' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  screenshot: z.string().optional(),
});

type DepositFormValues = z.infer<typeof depositSchema>;

export function DepositForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { addTransaction } = useWalletStore();
  const { toast } = useToast();
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: '',
      transactionId: '',
      name: user?.name || '',
      screenshot: '',
    },
  });
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPreviewImage(null);
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const onSubmit = async (data: DepositFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Add transaction to wallet store
      addTransaction({
        userId: user.id,
        type: 'deposit',
        amount: parseFloat(data.amount),
        status: 'pending',
        description: `Deposit of ₹${data.amount}`,
        details: {
          transactionId: data.transactionId,
          name: data.name,
          screenshot: previewImage || undefined,
        },
      });
      
      // Show success toast
      toast({
        title: 'Deposit request submitted',
        description: 'Your deposit will be processed once payment is verified.',
      });
      
      // Reset form
      form.reset({
        amount: '',
        transactionId: '',
        name: user.name,
        screenshot: '',
      });
      setPreviewImage(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Your deposit request could not be submitted. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Deposit Funds</CardTitle>
        <CardDescription>Add money to your wallet via UPI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          <div className="text-center flex flex-col items-center">
            <QRCode value="upi://pay?pa=9933308636@ybl&pn=LuckyLottery" size={180} />
            <p className="mt-2 text-sm font-medium">Scan to pay via UPI</p>
            <p className="mt-1 text-sm font-semibold">UPI ID: 9933308636@ybl</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Supports</p>
            <div className="flex gap-4 justify-center">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 bg-[#6739B7] rounded-full flex items-center justify-center text-white text-sm">PhP</div>
                <p className="text-xs mt-1">PhonePe</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 bg-[#00BAF2] rounded-full flex items-center justify-center text-white text-sm">PTM</div>
                <p className="text-xs mt-1">Paytm</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 bg-[#2DA94F] rounded-full flex items-center justify-center text-white text-sm">GP</div>
                <p className="text-xs mt-1">GPay</p>
              </div>
            </div>
          </div>
        </div>
        
        <Alert>
          <AlertDescription>
            <strong>KYC is NOT required</strong> to deposit or withdraw funds.
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
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the UPI transaction ID" {...field} />
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
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Payment Screenshot</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            
            {previewImage && (
              <div className="mt-2">
                <p className="text-sm mb-1">Screenshot Preview:</p>
                <img 
                  src={previewImage} 
                  alt="Payment screenshot" 
                  className="max-h-40 rounded-md border"
                />
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}