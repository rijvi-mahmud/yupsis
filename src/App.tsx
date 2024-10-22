/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createTree, flattenTree, unitConversion } from "./lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Button } from "./components/ui/button";

export type ItemType = {
  name: string;
  baseUnit?: string;
  conversionFactor?: number;
  id: string;
};

const units = [
  {
    id: "67165af3cf0bd5bee81fe78e",
    name: "Track",
    baseUnit: "67165ae8cf0bd5bee81fe78a",
    conversionFactor: 20,
  },
  {
    id: "67165ae8cf0bd5bee81fe78a",
    name: "Ton",
    baseUnit: "67165adacf0bd5bee81fe76f",
    conversionFactor: 1000,
  },
  {
    id: "67165adacf0bd5bee81fe76f",
    name: "Kg",
    baseUnit: "67165acbcf0bd5bee81fe767",
    conversionFactor: 1000,
  },
  {
    id: "67165acbcf0bd5bee81fe767",
    name: "Gram",
    conversionFactor: 0,
  },
];

const tree = createTree(units);
const flatArray = flattenTree(tree[0]).reverse();

// Define Yup validation schema
const schema = yup.object().shape({
  name: yup
    .string()
    .required("Product name is required")
    .min(5, "Product name must be at least 5 characters")
    .max(10, "Product name must be at most 10 characters"),
  unit: yup.string().required("Please select a unit"),
  conversionUnits: yup.array().of(
    yup.object().shape({
      name: yup
        .string()
        .required("Unit name is required")
        .min(5, "Unit name must be at least 5 characters")
        .max(10, "Unit name must be at most 10 characters"),
      quantity: yup
        .number()
        .required("Quantity is required")
        .min(1, "Quantity must be a positive number"),
      unit: yup.string(),
    })
  ),
});

function App() {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      unit: "",
      conversionUnits: [] as {
        name: string;
        quantity: number;
        unit: string;
      }[],
    },
  });

  function onSubmit() {
    const requestBody = form.getValues(); // Retrieve the form values

    const units = (requestBody.conversionUnits ?? []).reduce(
      (acc: Record<string, string>, unit: any) => {
        acc[unit.unit] = unit.quantity; // Use unit ID as key and quantity as value
        return acc;
      },
      {}
    );

    const formattedRequestBody = {
      name: requestBody.name,
      units, // Set the units object as expected
    };

    console.log(formattedRequestBody);
  }

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "conversionUnits",
  });

  function handleUnitChange(value: string) {
    const conversionUnits = unitConversion(units, value); // Get conversion units

    form.reset({
      ...form.getValues(),
      conversionUnits: [],
    });

    form.setValue("unit", value); // Update form state

    conversionUnits.forEach((unit) => {
      append({ unit: unit.id, quantity: 0, name: "" });
    });
  }

  return (
    <div className="p-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-10"
        >
          <div className="flex items-center gap-10">
            {/* Product Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit Selection Field */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Unit</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => handleUnitChange(value)}
                      defaultValue={field.value as string}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {flatArray.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-5">
            {/* Dynamic fields for conversion units */}
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-center">
                {/* Dynamic Unit Name Field */}
                <FormField
                  control={form.control}
                  name={`conversionUnits.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Unit Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dynamic Quantity Field */}
                <FormField
                  control={form.control}
                  name={`conversionUnits.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Quantity"
                          {...field}
                          min={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remove button */}
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="self-end"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button className="mt-5 w-48" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default App;
