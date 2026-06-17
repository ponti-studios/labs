# Dynamic Form Renderer

*Courtesy of Quilt*

Schema-driven form rendering in React — loading field definitions asynchronously and managing state for an unknown number of fields of unknown types.

---

## Why dynamic forms?

A hardcoded form is simple — a fixed set of `useState` calls, a fixed JSX structure, done. But content management systems, no-code builders, and multi-tenant SaaS products all need forms that change without a deployment. The field definitions come from a database, not from source code.

The challenge is to write a renderer that handles whatever schema the server sends — new field types, changed labels, reordered fields — without touching the component.

---

## The field schema

The schema is a typed union: each field has a `type` that determines which element to render, and type-specific properties (like `options` for selects) are optional. The renderer narrows the type at runtime and renders accordingly.

```ts
interface FormOption {
  value: string;
  text: string;
}

interface FormField {
  label: string;
  name: string;
  type: "text" | "email" | "password" | "select";
  value?: string;         // optional default value
  options?: FormOption[]; // only for type === "select"
}
```

---

## Async loading

Field definitions are fetched in a `useEffect`. The component renders a loading state until the schema arrives, then switches to the form. This pattern is exactly what you'd use against a real API — the `setTimeout` in the implementation is a stand-in for a network call.

```ts
useEffect(() => {
  fetchFields("/api/form-schema").then((fields) => {
    setFields(fields);
    setLoading(false);
  });
}, []);

// The loading state matters: if you render before fields arrive,
// you either show a blank form or flash incomplete UI.
// The loading flag gates rendering until the schema is ready.
```

---

## The renderer

The render function maps over the fields array and dispatches on `field.type`. Adding a new field type — a date picker, a checkbox group, a rich text editor — means adding one branch here. The rest of the form is untouched.

```tsx
function renderField(field: FormField, onChange: (name: string, value: string) => void) {
  if (field.type === "select") {
    return (
      <Select onValueChange={(v) => onChange(field.name, v)}>
        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
        <SelectContent>
          {field.options!.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.text}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={field.type}
      defaultValue={field.value}
      onChange={(e) => onChange(field.name, e.target.value)}
    />
  );
}
```

---

## Flexible state with a flat Record

Because the fields aren't known at compile time, per-field state (one `useState` per field) isn't an option. Instead, a single `Record<string, string>` keyed by field name holds everything. It's sparse by default — only touched fields have entries — and expands naturally as the user fills the form.

```ts
const [formValues, setFormValues] = useState<Record<string, string>>({});

const handleChange = (name: string, value: string) => {
  setFormValues((prev) => ({ ...prev, [name]: value }));
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  await fetch("/api/submit", {
    method: "POST",
    body: JSON.stringify(formValues),
  });
};
```

---

## Controlled vs uncontrolled inputs

This is the most common design decision in any form component. Controlled inputs let React validate and transform on every keystroke, at the cost of wiring every field to state. Uncontrolled inputs are lighter but make mid-input validation harder.

```tsx
// Controlled: React owns the value. Every keystroke calls setState.
<Input
  value={formValues[field.name] ?? ""}
  onChange={(e) => handleChange(field.name, e.target.value)}
/>

// Uncontrolled: the DOM owns the value. React only reads it when needed.
<Input
  defaultValue={field.value}
  onChange={(e) => handleChange(field.name, e.target.value)}
/>

// This implementation uses a middle path: DOM-owned rendering with a
// change handler that syncs to state — collecting values for submit
// without paying the per-keystroke re-render cost.
```
