import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const { id } = itemContext;
  const { name, error } = fieldContext;

  return {
    id,
    name,
    error,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  };
};

interface FormFieldContextValue {
  name: string;
  error?: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return <Label className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return <p id={formDescriptionId} className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ?? children;

  if (!body) {
    return null;
  }

  return (
    <p id={formMessageId} className={cn("text-destructive text-sm font-medium", className)} {...props}>
      {body}
    </p>
  );
}

interface FormFieldProps extends React.ComponentProps<"div"> {
  name: string;
  error?: string;
}

function FormField({ name, error, children, ...props }: FormFieldProps) {
  return (
    <FormFieldContext.Provider value={{ name, error }}>
      <FormItem {...props}>{children}</FormItem>
    </FormFieldContext.Provider>
  );
}

export { useFormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
