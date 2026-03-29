"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Item {
  id: number
  item: string
  category: string
  charged: number
  benchmark: number
  overcharge: number
  quantity: number
  is_overcharged: boolean
}

interface BreakdownTableProps {
  items: Item[]
}

export function BreakdownTable({ items }: BreakdownTableProps) {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden border-white/10">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="hover:bg-transparent border-white/10">
            <TableHead className="text-muted-foreground font-bold">Procedure / Medicine</TableHead>
            <TableHead className="text-muted-foreground font-bold">Category</TableHead>
            <TableHead className="text-muted-foreground font-bold text-right">Qty</TableHead>
            <TableHead className="text-muted-foreground font-bold text-right">Billed Price</TableHead>
            <TableHead className="text-muted-foreground font-bold text-right">Govt. Price</TableHead>
            <TableHead className="text-muted-foreground font-bold text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-white/5 border-white/5 transition-colors">
              <TableCell className="font-bold text-white">{item.item}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-white/10 text-muted-foreground">
                  {item.category}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">{item.quantity}</TableCell>
              <TableCell className="text-right font-black text-rose-500">₹{item.charged.toLocaleString()}</TableCell>
              <TableCell className="text-right font-bold text-emerald-500">₹{item.benchmark.toLocaleString()}</TableCell>
              <TableCell className="text-center">
                {item.is_overcharged ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-black border border-rose-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Overpriced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Fair
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
