import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, AlertTriangle, Percent, FileCheck } from "lucide-react"

interface SummaryCardsProps {
  totalBill: number
  totalOvercharge: number
  percentageOvercharge: number
}

export function SummaryCards({ totalBill, totalOvercharge, percentageOvercharge }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Bill Charged",
      value: `₹${totalBill.toLocaleString()}`,
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Identified Overcharges",
      value: `₹${totalOvercharge.toLocaleString()}`,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Overcharge Percentage",
      value: `${percentageOvercharge}%`,
      icon: Percent,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Verified Charges",
      value: `₹${(totalBill - totalOvercharge).toLocaleString()}`,
      icon: FileCheck,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.title === "Identified Overcharges" ? "Requires attention" : "Based on AI analysis"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
