'use client';

import { useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { deleteFieldAction } from '@/app/actions/fields';

interface DeleteFieldButtonProps {
  fieldId: number;
  fieldName: string;
}

export function DeleteFieldButton({ fieldId, fieldName }: DeleteFieldButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`"${fieldName}" sahasını silmek istediğinize emin misiniz?`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteFieldAction(fieldId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
      className="h-8 gap-1.5 px-2.5 text-red-500 hover:bg-red-50 hover:text-red-700"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      Sil
    </Button>
  );
}
