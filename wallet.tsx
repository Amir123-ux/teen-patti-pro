import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { DepositForm } from '@/components/wallet/deposit-form';
import { WithdrawForm } from '@/components/wallet/withdraw-form';
import { TransactionList } from '@/components/wallet/transaction-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore, useWalletStore } from '@/lib/store';

export default function WalletPage() {
  const { isAuthenticated } = useAuthStore();
  const { balance } = useWalletStore();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">My Wallet</h1>
              <p className="text-muted-foreground">Manage your funds</p>
            </div>
            <Card className="w-full md:w-auto bg-primary text-primary-foreground">
              <CardContent className="p-4">
                <div className="text-sm">Available Balance</div>
                <div className="text-2xl font-bold">₹{balance.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
          
          <Alert>
            <AlertDescription>
              <strong>KYC is NOT required</strong> to deposit or withdraw funds.
            </AlertDescription>
          </Alert>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View all your wallet transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionList />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="deposit" className="mt-6">
              <DepositForm />
            </TabsContent>
            <TabsContent value="withdraw" className="mt-6">
              <WithdrawForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}