import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useAuthStore, useAdminStore, useWalletStore } from '@/lib/store';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    pendingDeposits, 
    pendingWithdrawals, 
    users, 
    todayWinners, 
    approvePendingDeposit, 
    approvePendingWithdrawal,
    rejectPendingTransaction,
    runDailyDraw
  } = useAdminStore();
  const { transactions } = useWalletStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('deposits');
  
  // Redirect to homepage if not authenticated or not an admin
  if (!isAuthenticated || user?.id !== 'admin') {
    return <Navigate to="/" />;
  }
  
  // In real app, we would fetch these from the database
  const allDeposits = transactions.filter(t => t.type === 'deposit');
  const allWithdrawals = transactions.filter(t => t.type === 'withdraw');
  
  const handleRunDraw = () => {
    runDailyDraw();
    toast({
      title: 'Daily draw completed',
      description: 'The lottery results have been updated.',
    });
  };
  
  return (
    <Layout>
      <div className="container py-12">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{users.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Pending Deposits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pendingDeposits.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Pending Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pendingWithdrawals.length}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Daily Draw Management</CardTitle>
              <CardDescription>Run the daily draw to determine winners</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleRunDraw}>Run Daily Draw</Button>
            </CardContent>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposits" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deposit Requests</CardTitle>
                  <CardDescription>Manage deposit requests from users</CardDescription>
                </CardHeader>
                <CardContent>
                  {allDeposits.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allDeposits.map((deposit) => (
                          <TableRow key={deposit.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(deposit.timestamp), 'dd/MM/yyyy HH:mm')}
                            </TableCell>
                            <TableCell>{deposit.userId}</TableCell>
                            <TableCell>₹{deposit.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  deposit.status === 'completed'
                                    ? 'default'
                                    : deposit.status === 'pending'
                                    ? 'outline'
                                    : 'destructive'
                                }
                              >
                                {deposit.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{deposit.details?.transactionId || 'N/A'}</TableCell>
                            <TableCell className="space-x-2">
                              {deposit.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => approvePendingDeposit(deposit.id)}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => rejectPendingTransaction(deposit.id, 'deposit')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No deposit requests</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="withdrawals" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal Requests</CardTitle>
                  <CardDescription>Manage withdrawal requests from users</CardDescription>
                </CardHeader>
                <CardContent>
                  {allWithdrawals.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>UPI ID</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allWithdrawals.map((withdrawal) => (
                          <TableRow key={withdrawal.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(withdrawal.timestamp), 'dd/MM/yyyy HH:mm')}
                            </TableCell>
                            <TableCell>{withdrawal.userId}</TableCell>
                            <TableCell>₹{withdrawal.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  withdrawal.status === 'completed'
                                    ? 'default'
                                    : withdrawal.status === 'pending'
                                    ? 'outline'
                                    : 'destructive'
                                }
                              >
                                {withdrawal.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{withdrawal.details?.upiId || 'N/A'}</TableCell>
                            <TableCell className="space-x-2">
                              {withdrawal.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => approvePendingWithdrawal(withdrawal.id)}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => rejectPendingTransaction(withdrawal.id, 'withdraw')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No withdrawal requests</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  {users.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.mobile}</TableCell>
                            <TableCell>₹{user.balance.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No users found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}