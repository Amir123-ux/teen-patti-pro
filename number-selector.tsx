import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTicketStore } from '@/lib/store';

export function NumberSelector() {
  const { selectedNumbers, toggleNumber, clearSelectedNumbers } = useTicketStore();
  
  // Clear selected numbers when component unmounts
  useEffect(() => {
    return () => {
      clearSelectedNumbers();
    };
  }, [clearSelectedNumbers]);
  
  // Generate array of numbers from 0 to 49
  const numbers = Array.from({ length: 50 }, (_, i) => i);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);
          
          return (
            <Button
              key={num}
              type="button"
              variant={isSelected ? "default" : "outline"}
              className={`h-10 w-10 p-0 ${isSelected ? 'ring-2 ring-primary' : ''}`}
              onClick={() => toggleNumber(num)}
              disabled={selectedNumbers.length >= 5 && !isSelected}
            >
              {num}
            </Button>
          );
        })}
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={clearSelectedNumbers}
          disabled={selectedNumbers.length === 0}
        >
          Clear Selection
        </Button>
        
        <div className="text-sm">
          {selectedNumbers.length} of 5 numbers selected
        </div>
      </div>
    </div>
  );
}