import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

export interface BillItem {
  id: string
  name: string
  chargedPrice: number
  benchmarkPrice: number
  difference: number
  isOvercharged: boolean
}

interface BillTableProps {
  items: BillItem[]
}

export function BillTable({ items }: BillTableProps) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-semibold">Item Name</TableHead>
            <TableHead className="font-semibold">Charged Price</TableHead>
            <TableHead className="font-semibold">Benchmark (Fair) Price</TableHead>
            <TableHead className="font-semibold text-right">Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="transition-colors hover:bg-muted/30">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {item.isOvercharged && <AlertCircle className="h-4 w-4 text-destructive" />}
                  {item.name}
                  {item.isOvercharged && (
                    <Badge variant="destructive" className="ml-2 font-normal text-[10px] uppercase tracking-wider">
                      Overcharged
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-semibold">₹{item.chargedPrice.toLocaleString()}</TableCell>
              <TableCell className="text-muted-foreground">₹{item.benchmarkPrice.toLocaleString()}</TableCell>
              <TableCell className={`text-right font-bold ${item.isOvercharged ? "text-destructive" : "text-green-600"}`}>
                {item.difference > 0 ? `+₹${item.difference.toLocaleString()}` : `₹${item.difference.toLocaleString()}`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
