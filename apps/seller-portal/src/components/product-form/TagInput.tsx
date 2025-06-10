"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface TagInputProps {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function TagInput({ 
  items, 
  onAdd, 
  onRemove, 
  placeholder, 
  variant = "secondary" 
}: TagInputProps) {
  const [currentItem, setCurrentItem] = useState("");

  const handleAdd = () => {
    if (currentItem && !items.includes(currentItem)) {
      onAdd(currentItem);
      setCurrentItem("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input 
          value={currentItem}
          onChange={(e) => setCurrentItem(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
        />
        <Button type="button" onClick={handleAdd} variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant={variant} className="flex items-center gap-1">
            {item}
            <button 
              type="button" 
              onClick={() => onRemove(item)}
              className="ml-1 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}