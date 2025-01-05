"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, UserIcon } from 'lucide-react'
import { config } from "@/config"
import { useAuth } from "@/contexts/auth-context"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: string
  type: "incoming" | "outgoing"
  amount: number
  otherParty: string
  timestamp: string
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { token } = useAuth()

  const fetchTransactions = useCallback(async () => {
    if (!token) return
    
    try {
      setIsLoading(true)
      const response = await fetch(`${config.apiBaseUrl}/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }
      const data = await response.json()
      setTransactions(data.transactions)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, token])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-md bg-muted"
          />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        No transactions found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              {transaction.type === "incoming" ? (
                <ArrowDownIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowUpIcon className="h-4 w-4 text-red-500" />
              )}
            </TableCell>
            <TableCell className={transaction.type === "incoming" ? "text-green-600" : "text-red-600"}>
              ${transaction.amount.toFixed(2)}
            </TableCell>
            <TableCell className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              {transaction.otherParty}
            </TableCell>
            <TableCell className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {new Date(transaction.timestamp).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

