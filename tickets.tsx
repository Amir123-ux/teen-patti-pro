import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { TicketGrid } from '@/components/tickets/ticket-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuthStore, useTicketStore } from '@/lib/store';
import { Ticket } from '@/lib/types';

export default function TicketsPage() {
  const { isAuthenticated } = useAuthStore();
  const { tickets } = useTicketStore();
  const [activeTab, setActiveTab] = useState('all');
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Filter tickets based on active tab
  const getFilteredTickets = (): Ticket[] => {
    switch (activeTab) {
      case 'active':
        return tickets.filter(ticket => ticket.status === 'active');
      case 'completed':
        return tickets.filter(ticket => ['drawn', 'won', 'lost'].includes(ticket.status));
      case 'won':
        return tickets.filter(ticket => ticket.status === 'won');
      default:
        return tickets;
    }
  };
  
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">My Tickets</h1>
              <p className="text-muted-foreground">View all your lottery tickets</p>
            </div>
            <Button asChild>
              <Link to="/buy">Buy New Tickets</Link>
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Tickets</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="won">Winners</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              <TicketGrid tickets={getFilteredTickets()} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}