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
import { useMemo, useState } from "react";
import FormComboBox from "../common/FormComboBox";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RequiredFormLabel from "@/components/applications/add-application/common/RequiredFormLabel";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  getSingleEntitlementObjectSchema,
  SingleEntitlementConnectorObjectSchemaType,
} from "@/components/applications/add-application/schemas/schemaFormSchema";
import { infer as zInfer } from "zod";

export function AddObjectDialog({
  connectorObjects,
  onObjectSelected,
}: {
  connectorObjects: string[];
  onObjectSelected: (
    object: Omit<
      SingleEntitlementConnectorObjectSchemaType,
      "entitlementDisplayNameAttribute"
    >
  ) => void;
}) {
  const connectorObjectsDropDownOptions = useMemo(
    () =>
      connectorObjects.map((obj) => ({
        label: obj,
        id: obj,
      })),
    [connectorObjects]
  );
  const schema = useMemo(
    () =>
      getSingleEntitlementObjectSchema(connectorObjects).omit({
        entitlementDisplayNameAttribute: true,
      }),
    [connectorObjects]
  );

  const form = useForm<zInfer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      attributes: [],
      capabilities: [],
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          form.reset(); // reset when dialog closes
        }
        setDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus /> New Entitlement
        </Button>
      </DialogTrigger>
      <DialogContent
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Add New Entitlement</DialogTitle>
          <DialogDescription>
            Create a new entitlement to organize schema attributes for this
            application.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>Name</RequiredFormLabel>
                    <FormControl>
                      <FormComboBox
                        placeholder="Select an Object"
                        searchPlaceholder="Search for Object"
                        options={connectorObjectsDropDownOptions}
                        selectedValue={field.value}
                        onSelect={field.onChange}
                        notFoundText="Object not found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter object display name (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          placeholder="Enter object description (optional)"
                          maxLength={200}
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <div className="absolute mt-1 text-xs text-right text-muted-foreground right-2 bottom-2">
                        {field.value?.length ?? 0} / 200
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={form.handleSubmit((data) => {
              onObjectSelected(data);
              setDialogOpen(false);
              form.reset();
            })}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
