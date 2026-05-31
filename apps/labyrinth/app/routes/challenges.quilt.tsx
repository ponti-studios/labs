import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pontistudios/ui";
import { useEffect, useState } from "react";

/**
 * Quilt Take-Home Challenge
 *
 * Task: Build a dynamic form renderer in React that loads field definitions
 * asynchronously and manages form state flexibly based on those definitions.
 */
interface FormOption {
  value: string;
  text: string;
}

interface FormField {
  label: string;
  name: string;
  type: string;
  value?: string;
  options?: FormOption[];
}

export default function Quilt() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setTimeout(() => {
      setFields([
        { label: "First name", name: "firstName", type: "text", value: "Joe" },
        { label: "Last name", name: "lastName", type: "text" },
        { label: "Email", name: "email", type: "email" },
        { label: "Password", name: "password", type: "password" },
        {
          label: "Country",
          name: "country",
          type: "select",
          options: [
            { value: "us", text: "United States" },
            { value: "uk", text: "United Kingdom" },
            { value: "ca", text: "Canada" },
          ],
        },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    console.log(`${name}: ${value}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formValues);
    alert("Form submitted! Check console for values.");
  };

  return (
    <div>
      <h2>Quilt - Form Builder</h2>
      <p>A dynamic form builder that loads field definitions asynchronously.</p>

      <div className="card">
        {loading ? (
          <div className="text-center p-8">
            <p>Loading form fields...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.name} className="mb-4">
                <Label htmlFor={field.name} className="block mb-1 font-medium">
                  {field.label}
                </Label>
                {field.type === "select" ? (
                  <Select
                    name={field.name}
                    onValueChange={(value) => handleChange(field.name, value)}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options!.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type === "text" ? "text" : field.type}
                    defaultValue={field.value}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}
            <Button type="submit" className="btn btn-primary mt-4">
              Submit
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
