import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface ExtraHeadersEditorProps {
  headers: Record<string, string>;
  onChange: (headers: Record<string, string>) => void;
  disabled?: boolean;
}

interface HeaderRow {
  id: string;
  key: string;
  value: string;
}

export function ExtraHeadersEditor({
  headers,
  onChange,
  disabled = false
}: ExtraHeadersEditorProps) {
  const [rows, setRows] = useState<HeaderRow[]>(() => {
    const entries = Object.entries(headers);
    if (entries.length === 0) {
      return [{ id: '1', key: '', value: '' }];
    }
    return entries.map(([key, value], index) => ({
      id: (index + 1).toString(),
      key,
      value
    }));
  });

  const updateHeaders = (newRows: HeaderRow[]) => {
    const newHeaders: Record<string, string> = {};
    newRows.forEach(row => {
      if (row.key.trim() && row.value.trim()) {
        newHeaders[row.key.trim()] = row.value.trim();
      }
    });
    onChange(newHeaders);
  };

  const updateRow = (id: string, field: 'key' | 'value', newValue: string) => {
    const newRows = rows.map(row =>
      row.id === id ? { ...row, [field]: newValue } : row
    );
    setRows(newRows);
    updateHeaders(newRows);
  };

  const addRow = () => {
    const newId = (Math.max(...rows.map(r => parseInt(r.id))) + 1).toString();
    const newRows = [...rows, { id: newId, key: '', value: '' }];
    setRows(newRows);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) {
      // Keep at least one row, but clear it
      const newRows = [{ id: '1', key: '', value: '' }];
      setRows(newRows);
      updateHeaders(newRows);
    } else {
      const newRows = rows.filter(row => row.id !== id);
      setRows(newRows);
      updateHeaders(newRows);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Extra Headers (Optional)</Label>
      <Card>
        <CardContent className="p-4 space-y-3">
          {rows.map((row, index) => (
            <div key={row.id} className="flex gap-2 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Header name"
                  value={row.key}
                  onChange={(e) => updateRow(row.id, 'key', e.target.value)}
                  disabled={disabled}
                  className="text-sm"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Header value"
                  value={row.value}
                  onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                  disabled={disabled}
                  className="text-sm"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeRow(row.id)}
                disabled={disabled}
                className="px-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove header</span>
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            disabled={disabled}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Header
          </Button>
          
          {Object.keys(headers).length > 0 && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <div className="space-y-1">
                {Object.entries(headers).map(([key, value]) => (
                  <div key={key} className="text-xs font-mono">
                    <span className="text-blue-600">{key}</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-green-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
