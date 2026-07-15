import React from 'react';

interface Column {
    header: string;
    key?: string;
    render?: (item: any) => React.ReactNode;
    className?: string;
}

export function DataTable({ 
    columns, 
    data, 
    emptyMessage = "No records found" 
}: { 
    columns: Column[]; 
    data: any[]; 
    emptyMessage?: string 
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200">
                        {columns.map((col, idx) => (
                            <th key={idx} className={`text-left py-3 px-4 text-sm font-medium text-slate-500 ${col.className || ''}`}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length > 0 ? (
                        data.map((item, rowIndex) => (
                            <tr key={item.id || rowIndex} className="hover:bg-slate-50 transition-colors">
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className={`py-3 px-4 text-sm text-slate-700 ${col.className || ''}`}>
                                        {col.render ? col.render(item) : (col.key ? item[col.key] : '-')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="py-8 text-center text-slate-500 italic">
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
