"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ChevronLeft, HelpCircle } from "lucide-react"
import Link from "next/link"
import Confetti from "react-confetti"

interface MachineDetails {
  id: string
  name: string
  location: string
  items: Array<{
    id: string
    name: string
    price: number
  }>
}

export default function MachinePayPage() {
  const { activeAccount } = useWallet()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const machineId = params["machine-id"] as string

  const [machineDetails, setMachineDetails] = useState<MachineDetails | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [transactionComplete, setTransactionComplete] = useState(false)

  const urlPrice = searchParams.get("price")
  const urlItem = searchParams.get("item")

  useEffect(() => {
    if (!activeAccount) {
      setLoading(false)
      return
    }

    try {
      // Decode base64 machine ID
      const decodedId = Buffer.from(machineId, "base64").toString("utf-8")
      console.log("[v0] Decoded machine ID:", decodedId)

      // Mock machine details - in production, fetch from API
      const mockMachines: Record<string, MachineDetails> = {
        "machine-001": {
          id: "machine-001",
          name: "Downtown Vending Machine",
          location: "123 Main Street, Downtown",
          items: [
            { id: "1", name: "Soda", price: 2.5 },
            { id: "2", name: "Snacks", price: 1.5 },
            { id: "3", name: "Water", price: 1.0 },
            { id: "4", name: "Coffee", price: 3.0 },
          ],
        },
        "machine-002": {
          id: "machine-002",
          name: "Airport Terminal Vending",
          location: "Terminal 2, Gate A5",
          items: [
            { id: "1", name: "Premium Snacks", price: 4.0 },
            { id: "2", name: "Energy Drink", price: 3.5 },
            { id: "3", name: "Sandwich", price: 6.0 },
          ],
        },
      }

      const machine = mockMachines[decodedId] || mockMachines["machine-001"]
      setMachineDetails(machine)

      if (urlPrice) {
        setAmount(urlPrice)
      }

      setLoading(false)
    } catch (err) {
      console.error("[v0] Error decoding machine ID:", err)
      setError("Invalid machine ID")
      setLoading(false)
    }
  }, [activeAccount, machineId, urlPrice])

  const handleNumberClick = (num: string) => {
    if (transactionComplete) return

    if (num === ".") {
      if (!amount.includes(".")) {
        setAmount(amount + num)
      }
    } else {
      setAmount(amount + num)
    }
  }

  const handleBackspace = () => {
    if (transactionComplete) return
    setAmount(amount.slice(0, -1))
  }

  const handleClear = () => {
    if (transactionComplete) return
    setAmount("")
  }

  const handleMax = () => {
    if (transactionComplete) return
    setAmount("100")
  }

  const handlePlaceOrder = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    console.log("[v0] Payment initiated for", amount, "ALGO", "Item:", urlItem || "Unknown")

    setShowConfetti(true)
    setTransactionComplete(true)

    // Auto-hide confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false)
    }, 3000)

    // In production, initiate actual payment transaction
  }

  if (!activeAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center px-4">
        <Card className="bg-slate-800 border-orange-500/20 p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to use this vending machine and make payments in ALGO.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg"
          >
            Go to Home
          </Button>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="text-white">Loading machine details...</div>
      </div>
    )
  }

  if (!machineDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="text-white">Machine not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black py-8 px-4">
      {showConfetti && <Confetti />}

      <div className="flex justify-between items-center mb-8 px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="text-xl font-bold text-white">Scan & Pay ALGO</h1>
        <Link href="/help" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <HelpCircle size={20} />
          <span className="hidden sm:inline">Help</span>
        </Link>
      </div>

      <div className="container max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-slate-800 border-orange-500/20 p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{machineDetails.name}</h2>
            <p className="text-gray-400 mb-6">{machineDetails.location}</p>

            <div className="space-y-3">
              <h3 className="text-orange-500 font-semibold text-lg">Available Items:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {machineDetails.items.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg p-4 border border-orange-500/30 hover:border-orange-500/60 transition-all cursor-pointer"
                  >
                    <p className="text-white font-semibold text-base">{item.name}</p>
                    <p className="text-orange-400 text-lg font-bold mt-2">{item.price} ALGO</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center"
        >
          <Card className="bg-slate-800 border-orange-500/20 p-8 w-full max-w-md">
            {transactionComplete && (
              <div className="text-center mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-400 font-semibold">✓ Transaction Complete!</p>
                <p className="text-green-300 text-sm mt-1">
                  {urlItem ? `You ordered: ${urlItem}` : "Your order has been placed"}
                </p>
              </div>
            )}

            {/* Info box */}
            <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-orange-500/30 flex gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 flex-shrink-0" />
              <p className="text-gray-300 text-sm">
                {urlItem
                  ? `Paying for: ${urlItem}`
                  : "Please ask the vendor for the bill amount only. Don't ask for a QR yet."}
              </p>
            </div>

            {/* Amount display */}
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-orange-500 mb-2">{amount || "0"}</div>
              <div className="text-gray-400 text-sm">ALGO</div>
              <p className="text-gray-500 text-xs mt-4">Available Balance: 1000 ALGO</p>
            </div>

            {/* Transaction limit */}
            <div className="bg-slate-900 rounded-lg p-3 mb-6 border border-orange-500/20 flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded flex-shrink-0" />
              <p className="text-gray-300 text-sm">Your Transaction Limit: 500 ALGO</p>
            </div>

            {/* Numeric keypad */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num.toString())}
                  disabled={transactionComplete}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Bottom row: decimal, 0, backspace */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => handleNumberClick(".")}
                disabled={transactionComplete}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
              >
                .
              </button>
              <button
                onClick={() => handleNumberClick("0")}
                disabled={transactionComplete}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                disabled={transactionComplete}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-4 rounded-lg transition-colors"
              >
                ⌫
              </button>
            </div>

            {/* Max and Clear buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleMax}
                disabled={transactionComplete}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-orange-400 font-semibold py-3 rounded-lg transition-colors"
              >
                Max
              </button>
              <button
                onClick={handleClear}
                disabled={transactionComplete}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-orange-400 font-semibold py-3 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Place Order button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={transactionComplete}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all"
            >
              {transactionComplete ? "Order Placed ✓" : "Place Order"}
            </Button>

            {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
