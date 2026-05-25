import { useState, useEffect } from "react";

export default function Quilt() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({});

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

  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    console.log(`${name}: ${value}`);
  };

  const handleSubmit = (e) => {
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
                  <select
                    id={field.name}
                    name={field.name}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  >
                    <option value="">Select...</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.text}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type === "text" ? "text" : field.type}
                    defaultValue={field.value}
                    onChange={(e) => handleChange(field.name, e.target.value)}
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
