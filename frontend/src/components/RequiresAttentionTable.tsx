import React from "react";
import { ExceptionItem } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { AlertOctagon, ArrowUpRight } from "lucide-react";

interface RequiresAttentionTableProps {
  exceptions: ExceptionItem[];
  onActionClick?: (item: ExceptionItem) => void;
}

export const RequiresAttentionTable: React.FC<RequiresAttentionTableProps> = ({
  exceptions,
  onActionClick,
}) => {
  return (
    <div className="labflow-card overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
            Requires Attention
          </h3>
          <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200">
            {exceptions.length} Active Issues
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Priority Exception Queue
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
            <tr>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Test</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Issue / Alert Description</th>
              <th className="py-3 px-4">Age</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {exceptions.map((exc) => (
              <tr key={exc.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap">
                  <StatusBadge type="severity" value={exc.severity} size="sm" />
                </td>
                <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                  {exc.entity}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                  {exc.entityId}
                </td>
                <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                  {exc.test}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <StatusBadge type="stage" value={exc.stage} size="sm" />
                </td>
                <td className="py-3 px-4 text-slate-700 max-w-xs font-normal">
                  {exc.issue}
                </td>
                <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                  {exc.age}
                </td>
                <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                  {exc.assignedTo}
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => onActionClick && onActionClick(exc)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                  >
                    {exc.actionText}
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
