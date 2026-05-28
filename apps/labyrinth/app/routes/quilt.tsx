import { useEffect, useState, type FormEvent, type JSX } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pontistudios/ui";

interface SelectOption {
  value: string;
  text: string;
}

interface BaseField {
  label: string;
  name: string;
  value?: string;
}

interface TextField extends BaseField {
  type: "text" | "email" | "password";
}

interface SelectField extends BaseField {
  type: "select";
  options: SelectOption[];
}

type FormField = TextField | SelectField;
type FormValues = Record<string, string>;

const asyncFields: FormField[] = [
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
];

function buildInitialValues(fields: FormField[]): FormValues {
  return fields.reduce<FormValues>((values, field) => {
    values[field.name] = field.value ?? "";
    return values;
  }, {});
}

export default function Quilt(): JSX.Element {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<FormValues>({});

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFields(asyncFields);
      setFormValues(buildInitialValues(asyncFields));
      setLoading(false);
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleChange = (name: string, value: string): void => {
    setFormValues((previousValues) => ({ ...previousValues, [name]: value }));
    console.log(`${name}: ${value}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    console.log("Form submitted:", formValues);
    alert("Form submitted! Check console for values.");
  };

  return (
    <div>
      <h2>Quilt - Form Builder</h2>
      <p>A dynamic form builder that loads field definitions asynchronously.</p>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Loading form fields...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.name} style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor={field.name}
                  style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500" }}
                >
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <Select
                    value={formValues[field.name] || undefined}
                    onValueChange={(value) => handleChange(field.name, value)}
                  >
                    <SelectTrigger id={field.name} style={{ width: "100%" }}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={formValues[field.name] ?? ""}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  />
                )}
              </div>
            ))}
            <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}