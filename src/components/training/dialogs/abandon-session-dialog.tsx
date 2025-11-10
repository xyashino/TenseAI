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
import { NavigationRoutes } from "@/lib/enums/navigation";
import { useDeleteSession } from "@/lib/hooks/use-delete-session";
import { navigate } from "astro/virtual-modules/transitions-router.js";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";

interface AbandonSessionDialogProps {
  sessionId: string;
}

export function AbandonSessionDialog({ sessionId }: AbandonSessionDialogProps) {
  const deleteSession = useDeleteSession();

  const handleConfirm = async () => {
    try {
      await deleteSession.mutateAsync(sessionId);
      toast.success("Session abandoned");
      navigate(NavigationRoutes.TRAINING);
    } catch {
      toast.error("Failed to abandon session");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hidden lg:block">
          <TrashIcon />
          Abandon Session
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abandon Training Session?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to abandon this session? All progress will be lost and cannot be recovered. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteSession.isPending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleteSession.isPending} asChild>
            <AlertDialogAction>Abandon Session</AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
