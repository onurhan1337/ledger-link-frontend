"use client"

import { useEffect, useState } from "react"
import { BarChart, Clock, Send } from 'lucide-react'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TransactionHistory } from "@/components/transaction-history"
import { TransferDialog } from "@/components/transfer-dialog"

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0)
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  useEffect(() => {
    // Fetch balance from API
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/balance")
      const data = await response.json()
      setBalance(data.balance)
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => setIsTransferOpen(true)}>
          <Send className="mr-2 h-4 w-4" />
          Send Money
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Updated just now
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/transactions" className="text-sm text-muted-foreground hover:underline">
              View all transactions
            </Link>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionHistory />
        </CardContent>
      </Card>
      <TransferDialog 
        open={isTransferOpen} 
        onOpenChange={setIsTransferOpen}
        onTransferComplete={fetchBalance}
      />
    </div>
  )
}

