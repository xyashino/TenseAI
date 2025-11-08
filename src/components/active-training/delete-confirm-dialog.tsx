import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteSession } from "@/lib/hooks/use-delete-session";
import { TrashIcon } from "lucide-react";

interface DeleteConfirmDialogProps {
  sessionId: string;
}

export function DeleteConfirmDialog({ sessionId }: DeleteConfirmDialogProps) {
  const { mutate: deleteSession, isPending } = useDeleteSession();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon">
          <TrashIcon className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Training?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your training and all associated progress.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild onClick={() => deleteSession(sessionId)} disabled={isPending}>
            <Button variant="destructive">Delete</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
