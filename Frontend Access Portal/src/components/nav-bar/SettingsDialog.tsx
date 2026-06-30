import React from "react";
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
import { Button } from "@/components/ui/button";
import { Locale, useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { changeLocaleAction } from "@/app/actions/set-locale";
import { useThemeContext } from "@/contexts/themeConfigContext";
import { LOCALES } from "@/config/i18n";
import { Monitor, Moon, Sun } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

export default function SettingsDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const tCommon = useTranslations("common");
  const t = useTranslations("settings.user-dialog");
  const locale = useLocale();
  const { setTheme, mode } = useThemeContext();

  const form = useForm({
    defaultValues: {
      theme: mode,
      locale,
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-8">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="w-full space-y-6"
            onSubmit={form.handleSubmit((values) => {
              console.log("Selected values:", values);
              changeLocaleAction(values.locale as Locale);
              setTheme(values.theme);
            })}
          >
            {/* Language settings */}
            <FormField
              control={form.control}
              name="locale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("language.title")}</FormLabel>
                  <FormDescription>{t("language.description")}</FormDescription>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {LOCALES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            <p>
                              {t(`language.options.${lang}.native`)}
                              <span className="ml-2 text-sm text-muted-foreground">
                                {t(`language.options.${lang}.translated`)}
                              </span>
                            </p>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Theme settings */}
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("theme.title")}</FormLabel>
                  <FormDescription>{t("theme.description")}</FormDescription>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="light">
                          <Sun />
                          {t("theme.options.light")}
                        </SelectItem>
                        <SelectItem value="dark">
                          <Moon />
                          {t("theme.options.dark")}
                        </SelectItem>
                        <SelectItem value="system">
                          <Monitor />
                          {t("theme.options.system")}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => form.reset()}
                >
                  {tCommon("cancel")}
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit">{tCommon("save")}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
