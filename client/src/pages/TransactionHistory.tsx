import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PointTransaction } from "@shared/schema";

export default function TransactionHistory() {
  const { data: transactions = [], isLoading } = useQuery<PointTransaction[]>({
    queryKey: ['/api/user/transactions'],
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'spent':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'admin_added':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'admin_removed':
        return <Users className="h-4 w-4 text-orange-500" />;
      case 'transfer':
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionBadge = (type: string, amount: number) => {
    if (type === 'earned' || type === 'admin_added') {
      return (
        <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 dark:border-green-400">
          +{amount.toLocaleString()}
        </Badge>
      );
    } else if (type === 'spent' || type === 'admin_removed') {
      return (
        <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 dark:border-red-400">
          {amount.toLocaleString()}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-400">
          {amount >= 0 ? '+' : ''}{amount.toLocaleString()}
        </Badge>
      );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'earned':
        return 'Points Earned';
      case 'spent':
        return 'Points Spent';
      case 'admin_added':
        return 'Admin Added';
      case 'admin_removed':
        return 'Admin Removed';
      case 'transfer':
        return 'Transfer';
      default:
        return 'Transaction';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-6 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="text-page-title">
          Transaction History
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          View your complete point transaction history including earnings, spending, and admin adjustments.
        </p>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardHeader className="text-center pb-2">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle data-testid="text-no-transactions">No Transactions Yet</CardTitle>
            <CardDescription>
              Start earning points by watching the stream or redeeming rewards to see your transaction history here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="hover-elevate" data-testid={`card-transaction-${transaction.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0" data-testid={`icon-transaction-${transaction.type}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground" data-testid={`text-transaction-type-${transaction.id}`}>
                        {getTypeLabel(transaction.type)}
                      </p>
                      <p className="text-sm text-muted-foreground truncate" data-testid={`text-transaction-description-${transaction.id}`}>
                        {transaction.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="mb-1" data-testid={`badge-transaction-amount-${transaction.id}`}>
                      {getTransactionBadge(transaction.type, transaction.amount)}
                    </div>
                    <p className="text-xs text-muted-foreground" data-testid={`text-transaction-date-${transaction.id}`}>
                      {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}