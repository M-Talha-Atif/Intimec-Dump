import {
  QueryBuilder,
  Field,
  FieldSelectorProps,
  OperatorSelectorProps,
  CombinatorSelectorProps,
  RuleGroupHeaderComponents,
  RuleGroupBodyComponents,
  useRuleGroup,
  RuleComponents,
  useRule,
  FullCombinator,
  RuleGroupProps,
  RuleProps,
  NotToggleProps,
  ValueSelectorProps,
  ActionProps,
} from "react-querybuilder";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CircleAlert, Plus, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CorrelationFormSchemaType } from "../schemas/correlationSchema";
import {
  useController,
  useFormContext,
  get as hookFormGet,
  FieldErrors,
} from "react-hook-form";
import { memo, useCallback, useId, useMemo } from "react";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const ShadcnFieldSelector = ({
  options,
  value,
  handleOnChange,
  path,
  context,
}: FieldSelectorProps) => {
  const errors = context as Record<string, unknown> | undefined;
  const errorPath =
    path.reduce((acc, idx) => acc + `rules.${idx}.`, "") + "field";
  const error = hookFormGet(errors, errorPath);
  return (
    <div className="flex flex-col gap-1 min-w-40">
      <Select value={value} onValueChange={handleOnChange}>
        <SelectTrigger className="bg-background w-full">
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem
              key={(opt as FullCombinator).name}
              value={(opt as FullCombinator).name}
            >
              {opt.label ?? opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error?.message && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
};

const ShadcnOperatorSelector = ({
  options,
  value,
  handleOnChange,
  path,
  context,
}: OperatorSelectorProps) => {
  const errors = context as Record<string, unknown> | undefined;
  const errorPath =
    path.reduce((acc, idx) => acc + `rules.${idx}.`, "") + "operator";
  const error = hookFormGet(errors, errorPath);
  return (
    <div className="flex flex-col gap-1 min-w-20">
      <Select value={value} onValueChange={handleOnChange}>
        <SelectTrigger className="bg-background w-full">
          <SelectValue placeholder="Select operator" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem
              key={(opt as FullCombinator).name}
              value={(opt as FullCombinator).name}
            >
              {opt.label ?? opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error?.message && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
};

const ShadcnCombinatorSelector = ({
  options,
  value,
  handleOnChange,
}: CombinatorSelectorProps) => (
  <div className="flex items-center gap-2">
    <Badge variant={value === "and" ? "default" : "secondary"}>
      {options.find((opt) => (opt as FullCombinator).name === value)?.label ??
        value}
    </Badge>
    <Select value={value} onValueChange={handleOnChange}>
      <SelectTrigger className="max-w-20 bg-background flex-1">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem
            key={(opt as FullCombinator).name}
            value={(opt as FullCombinator).name}
          >
            {opt.label ?? opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const ShadcnValueSelector = ({
  value,
  handleOnChange,
  path,
  options,
  context,
}: ValueSelectorProps) => {
  const errors = context as Record<string, unknown> | undefined;
  const errorPath =
    path.reduce((acc, idx) => acc + `rules.${idx}.`, "") + "value";
  const error = hookFormGet(errors, errorPath);
  return (
    <div className="flex flex-col gap-1 min-w-40">
      <Select value={value} onValueChange={(val) => handleOnChange(val)}>
        <SelectTrigger className="bg-background w-full">
          <SelectValue placeholder="Select account attribute" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem
              key={(opt as FullCombinator).name}
              value={(opt as FullCombinator).name}
            >
              {opt.label ?? opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error?.message && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
};
const RuleGroupComponent = (props: RuleGroupProps) => {
  const rg = useRuleGroup(props);
  const { path, context } = props;
  const errors = context as Record<string, unknown> | undefined;
  const errorPath =
    path.reduce((acc, idx) => acc + `rules.${idx}.`, "") + "rules";
  const error = hookFormGet(errors, errorPath);
  return (
    <div className="w-full flex flex-col gap-3 border-1 rounded-md p-4 border-l-primary border-l-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <RuleGroupHeaderComponents {...rg} />
      </div>
      <div className="flex flex-col gap-2 ps-8 [&:empty]:hidden">
        <RuleGroupBodyComponents {...rg} />
        {rg.ruleGroup.rules.length === 0 && (
          <div className="text-center flex flex-col items-center justify-center py-1.5 text-muted-foreground">
            <CircleAlert className="size-6" />
            <p className="text-sm">No rules or groups defined</p>
          </div>
        )}
      </div>
      {error?.message && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
};

const RuleComponent = (props: RuleProps) => {
  const rl = useRule(props);
  return (
    <div className="flex flex-row gap-2 items-start [&>*:last-child]:ml-auto bg-muted/50 border-1 shadow-sm p-2 rounded-md">
      <RuleComponents {...rl} />
    </div>
  );
};

const NotToggleComponent = (props: NotToggleProps) => {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={props.checked}
        onCheckedChange={(checked) => props.handleOnChange(checked === true)}
      />
      <Label htmlFor={id}>
        {props.label}
      </Label>
    </div>
  );
};

const controlElements = {
  valueSelector: ShadcnValueSelector,
  fieldSelector: ShadcnFieldSelector,
  operatorSelector: ShadcnOperatorSelector,
  combinatorSelector: ShadcnCombinatorSelector,
  addRuleAction: (props: ActionProps) => (
    <Button
      size="default"
      variant="ghost"
      type="button"
      onClick={props.handleOnClick}
      className="ml-auto flex items-center"
    >
      <Plus /> <p>Rule</p>
    </Button>
  ),
  addGroupAction: (props: ActionProps) => (
    <Button
      size="default"
      variant="ghost"
      type="button"
      onClick={props.handleOnClick}
      className="flex items-center"
    >
      <Plus /> <p>Group</p>
    </Button>
  ),
  removeRuleAction: (props: ActionProps) => (
    <Button
      size="icon"
      type="button"
      variant="ghost"
      onClick={props.handleOnClick}
    >
      <Trash className="text-destructive" />
    </Button>
  ),
  removeGroupAction: (props: ActionProps) => (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={props.handleOnClick}
    >
      <Trash className="text-destructive" />
    </Button>
  ),
  ruleGroup: RuleGroupComponent,
  rule: RuleComponent,
  notToggle: NotToggleComponent,
};

function AttributeCorrelationEditor({
  name,
}: {
  name: keyof CorrelationFormSchemaType;
}) {
  const { systemAttributes, accountAttributes } = useAddApplicationContext();
  const { control } = useFormContext<CorrelationFormSchemaType>();
  const {
    field,
    formState: { errors },
  } = useController<CorrelationFormSchemaType, `${typeof name}.ruleGroup`>({
    name: `${name}.ruleGroup`,
    control,
  });
  const attributeErrors = errors[name] as FieldErrors<
    Extract<CorrelationFormSchemaType[typeof name], { mode: "attribute" }>
  >;

  const getValueOptionsByType = useCallback(
    (type: string) =>
      accountAttributes
        ?.filter((attr) => attr.type === type)
        .map((attr) => ({
          name: attr.name,
          label: attr.name,
          type: attr.type,
        })),
    [accountAttributes]
  );

  const fields: Field[] = useMemo(
    () =>
      systemAttributes?.map((attr) => ({
        name: attr.systemKey,
        label: attr.displayName,
        values: getValueOptionsByType(attr.dataType),
        valueEditorType: "select",
      })) ?? [],
    [systemAttributes, getValueOptionsByType]
  );

  return (
    <QueryBuilder
      fields={fields}
      query={field.value}
      onQueryChange={field.onChange}
      suppressStandardClassnames
      showNotToggle
      context={attributeErrors?.ruleGroup}
      controlElements={controlElements}
    />
  );
}
export default memo(AttributeCorrelationEditor);
