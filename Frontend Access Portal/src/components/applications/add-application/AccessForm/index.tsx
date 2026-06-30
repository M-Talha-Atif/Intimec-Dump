"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import NavigationButtons from "../NavigationButtons";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import { Brain, Clock, TriangleAlert, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  accessFormSchema,
  AccessFormSchemaType,
} from "../schemas/accessSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AccessCard = {
  name: keyof AccessFormSchemaType;
  title: string;

  description: string;
  icon: React.ElementType;
};

const accessCards: AccessCard[] = [
  {
    name: "accessReview",
    title: "Access Reviews",
    description:
      "Enable periodic access certification campaigns for this application.",
    icon: Users,
  },
  {
    name: "timeBoundAccess",
    title: "Time-Bound Access",
    description: "Automatically expire access after a specified period.",
    icon: Clock,
  },
  {
    name: "justInTimeAccess",
    title: "Just-In-Time Access",
    description: "Enable just-in-time access for this application.",
    icon: TriangleAlert,
  },
  {
    name: "peerDeviationDetector",
    title: "Peer Deviation Detector",
    description: "Detect and alert on peer access deviations.",
    icon: Brain,
  },
];

export default function AccessForm() {
  const {
    currentFormStep,
    finalFormData,
    handleFormUpdate,
    incrementStep,
    handleFinalSubmit,
    mode,
    applicationId,
  } = useAddApplicationContext();
  const router = useRouter();
  const form = useForm<AccessFormSchemaType>({
    resolver: zodResolver(accessFormSchema),
    defaultValues: finalFormData["access"] || {
      accessReview: false,
      justInTimeAccess: false,
      peerDeviationDetector: false,
      timeBoundAccess: false,
      timeBoundSettings: {
        defaultExpiryPeriod: 90,
        autoExtensionPolicy: "never",
      },
    } as AccessFormSchemaType,
  });

  // Auto-save form data when navigating away (unmount)
  useEffect(() => {
    return () => {
      handleFormUpdate("access", form.getValues());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enableTimeBoundAccessConfig = form.watch("timeBoundAccess");

  if (currentFormStep !== "access") return null;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          handleFormUpdate("access", data);
          incrementStep();
        })}
        id="details-form"
        className="flex flex-col h-full"
      >
        <h1 className="mb-4 text-lg font-semibold">Access Form</h1>
        <div className="h-full space-y-4">
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]">
            {accessCards.map((card) => (
              <FormField
                key={card.name}
                control={form.control}
                name={card.name}
                render={({ field }) => (
                  <FormItem>
                    <div
                      className="flex flex-col justify-between p-4 pr-6 rounded-xl border-1"
                      key={card.name}
                    >
                      <div className="flex flex-row items-center justify-between h-full gap-2">
                        <div className="h-full space-y-2">
                          <FormLabel className="flex flex-row items-center gap-2">
                            <card.icon className="size-4" /> {card.title}
                          </FormLabel>
                          <FormDescription>{card.description}</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
          {enableTimeBoundAccessConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Time-Bound Access Configuration</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-2">
                <FormField
                  control={form.control}
                  name="timeBoundSettings.defaultExpiryPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Expiry Period (days)</FormLabel>
                      <FormDescription>
                        Set the default number of days after which access will
                        expire.
                      </FormDescription>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeBoundSettings.autoExtensionPolicy"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Auto Extension Policy</FormLabel>
                      <FormDescription>
                        Define the policy for automatic access extensions.
                      </FormDescription>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">
                              No extensions allowed
                            </SelectItem>
                            <SelectItem value="automatic">
                              Auto-extend if Active
                            </SelectItem>
                            <SelectItem value="manual">
                              Manual Review Required
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}
        </div>
        <NavigationButtons submitting={form.formState.isSubmitting}>
          <div className="flex justify-between w-full gap-2">
            <NavigationButtons.PreviousButton />
            <div className="space-x-2">
              <NavigationButtons.FinishButton
                onClick={async (e) => {
                  e.preventDefault();
                  form.handleSubmit(
                    async (data) => {
                      if (
                        await handleFinalSubmit({
                          access: data,
                        })
                      ) {
                        if (mode === "edit" && applicationId) {
                          router.push(`/applications/${applicationId}/overview`);
                        } else {
                          router.push("/applications");
                        }
                      }
                    },
                    (errors) => {
                      console.error("Access save validation errors:", errors);
                      toast.error("Please fix validation errors before saving");
                    }
                  )();
                }}
              />
              <NavigationButtons.NextButton />
            </div>
          </div>
        </NavigationButtons>
      </form>
    </Form>
  );
}
