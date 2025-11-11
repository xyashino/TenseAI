import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReportQuestion } from "@/lib/hooks/use-report-question";
import { reportSchema, type ReportFormValues } from "@/lib/validation";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Flag } from "lucide-react";
import { useForm } from "react-hook-form";

interface ReportQuestionDialogProps {
  questionId: string;
  questionText: string;
}

export function ReportQuestionDialog({ questionId, questionText }: ReportQuestionDialogProps) {
  const { mutateAsync: reportQuestion, isPending: isReportingQuestion } = useReportQuestion();

  const form = useForm<ReportFormValues>({
    resolver: standardSchemaResolver(reportSchema),
    defaultValues: {
      comment: "",
    },
  });

  const onSubmit = async (data: ReportFormValues) => {
    await reportQuestion({
      question_id: questionId,
      report_comment: data.comment || undefined,
    });
  };

  const commentValue = form.watch("comment") || "";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          title="Report an error with this question"
        >
          <Flag className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Report Question Error</DialogTitle>
              <DialogDescription>
                Help us improve by reporting issues with this question. Your feedback is valuable.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Question</Label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  <p className="text-foreground">{questionText}</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <>
                    <FormLabel className="text-sm font-medium">
                      Additional Comments <span className="text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the issue you found..."
                        maxLength={1000}
                        rows={4}
                        className="resize-none"
                        disabled={isReportingQuestion}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground text-right">{commentValue.length}/1000</p>
                    <FormMessage />
                  </>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isReportingQuestion}>
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit" disabled={isReportingQuestion}>
                  Report Question
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
