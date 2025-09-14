import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpCircle, ArrowDownCircle, Gift, Users, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent' | 'admin_added' | 'admin_removed' | 'transfer';
  description: string;
  createdAt: Date;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  maxHeight?: number;
}

export default function TransactionHistory({ 
  transactions, 
  maxHeight = 400 
}: TransactionHistoryProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <ArrowUpCircle className="w-4 h-4 text-chart-3" />;
      case 'spent':
        return <Gift className="w-4 h-4 text-chart-4" />;
      case 'transfer':
        return <Users className="w-4 h-4 text-chart-1" />;
      case 'admin_added':
      case 'admin_removed':
        return <Settings className="w-4 h-4 text-chart-5" />;
      default:
        return <ArrowDownCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-chart-3';
    if (amount < 0) return 'text-chart-5';
    return 'text-muted-foreground';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'earned':
        return 'Earned';
      case 'spent':
        return 'Spent';
      case 'admin_added':
        return 'Added';
      case 'admin_removed':
        return 'Removed';
      case 'transfer':
        return 'Transfer';
      default:
        return type;
    }
  };

  if (transactions.length === 0) {
    return (
      <Card data-testid="card-transactions-empty">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Start earning points by participating in streams!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-transactions">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ height: maxHeight }} className="px-6 pb-6">
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                data-testid={`row-transaction-${transaction.id}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {getTransactionIcon(transaction.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" data-testid={`text-transaction-description-${transaction.id}`}>
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs" data-testid={`badge-transaction-type-${transaction.id}`}>
                        {getTypeLabel(transaction.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground" data-testid={`text-transaction-date-${transaction.id}`}>
                        {formatDistanceToNow(transaction.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span
                    className={`font-bold font-mono ${getTransactionColor(transaction.type, transaction.amount)}`}
                    data-testid={`text-transaction-amount-${transaction.id}`}
                  >
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}