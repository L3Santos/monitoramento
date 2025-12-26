import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface TerminalTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  title?: string;
}

export function TerminalTable<T>({ 
  data, 
  columns, 
  isLoading, 
  emptyMessage = "Nenhum dado encontrado",
  title
}: TerminalTableProps<T>) {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      {title && (
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            {title}
          </h3>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-mono">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={cn("px-6 py-3 font-medium", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="font-mono text-xs">Carregando dados...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground font-mono text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-muted/30 transition-colors group">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={cn("px-6 py-3 font-mono text-xs md:text-sm text-foreground/80 group-hover:text-foreground", col.className)}>
                      {col.cell 
                        ? col.cell(item) 
                        : col.accessorKey 
                          ? String(item[col.accessorKey]) 
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
