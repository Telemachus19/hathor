import React from 'react';
import './ui.css';

interface DataTableProps {
  columns: string[];
  children: React.ReactNode;
}

export function DataTable({ columns, children }: DataTableProps) {
  return (
    <div className="hathor-table-container">
      <table className="hathor-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
