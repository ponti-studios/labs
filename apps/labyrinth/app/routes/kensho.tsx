import { useMemo, useState, type ChangeEvent, type JSX } from "react";

type ContactColumnKey = "name" | "phone" | "city" | "age";
type ColumnType = "string" | "category" | "number";

interface Contact {
  name: string;
  phone: string;
  city: string;
  age: number;
}

interface ContactColumn {
  name: string;
  key: ContactColumnKey;
  type: ColumnType;
}

type ContactFilters = Record<ContactColumnKey, string>;

const firstNames = [
  "Emma",
  "Noah",
  "Olivia",
  "Liam",
  "Ava",
  "William",
  "Sophia",
  "Mason",
  "Isabella",
  "James",
  "Mia",
  "Benjamin",
  "Charlotte",
  "Jacob",
  "Abigail",
  "Michael",
  "Emily",
  "Elijah",
  "Harper",
  "Ethan",
  "Amelia",
  "Alexander",
  "Evelyn",
  "Oliver",
  "Elizabeth",
  "Daniel",
  "Sofia",
  "Lucas",
  "Madison",
  "Matthew",
  "Avery",
  "Aiden",
  "Ella",
  "Jackson",
  "Scarlett",
  "Logan",
  "Grace",
  "David",
  "Chloe",
  "Joseph",
  "Victoria",
  "Riley",
  "Henry",
  "Aria",
  "Owen",
  "Lily",
  "Sebastian",
  "Aubrey",
  "Gabriel",
  "Zoey",
  "Carter",
  "Penelope",
  "Jayden",
  "Lillian",
  "John",
  "Addison",
  "Luke",
  "Layla",
  "Anthony",
  "Natalie",
  "Isaac",
  "Camila",
  "Dylan",
  "Hannah",
  "Wyatt",
  "Brooklyn",
  "Andrew",
  "Zoe",
  "Nora",
  "Christopher",
  "Leah",
  "Grayson",
  "Savannah",
  "Jack",
  "Audrey",
  "Julian",
  "Claire",
  "Ryan",
  "Eleanor",
  "Skylar",
  "Levi",
  "Ellie",
  "Nathan",
  "Samantha",
  "Stella",
  "Paisley",
  "Caleb",
  "Hunter",
  "Christian",
  "Violet",
  "Isaiah",
  "Mila",
  "Thomas",
  "Allison",
  "Aaron",
  "Alexa",
  "Lincoln",
] as const;

const lastNames = [
  "Smith",
  "Jones",
  "Brown",
  "Johnson",
  "Williams",
  "Miller",
  "Taylor",
  "Wilson",
  "Davis",
  "White",
  "Clark",
  "Hall",
  "Thomas",
  "Thompson",
  "Moore",
  "Hill",
  "Walker",
  "Anderson",
  "Wright",
  "Martin",
  "Wood",
  "Allen",
  "Robinson",
  "Lewis",
  "Scott",
  "Young",
  "Jackson",
  "Adams",
  "Tryniski",
  "Green",
  "Evans",
  "King",
  "Baker",
  "John",
  "Harris",
  "Roberts",
  "Campbell",
  "James",
  "Stewart",
  "Lee",
  "County",
  "Turner",
  "Parker",
  "Cook",
  "Edwards",
  "Morris",
  "Mitchell",
  "Bell",
  "Ward",
  "Watson",
  "Morgan",
  "Davies",
  "Cooper",
  "Phillips",
  "Rogers",
  "Gray",
  "Hughes",
  "Harrison",
  "Carter",
  "Murphy",
] as const;

const cities = ["Cambridge, MA", "New York, NY", "McLean, VA", "Pacific Palisades, CA"] as const;

const columns: ContactColumn[] = [
  { name: "Name", key: "name", type: "string" },
  { name: "Phone Number", key: "phone", type: "string" },
  { name: "City", key: "city", type: "category" },
  { name: "Age", key: "age", type: "number" },
];

const initialFilters: ContactFilters = {
  name: "",
  phone: "",
  city: "",
  age: "",
};

const visibleRowCount = 50;
const contacts = generateContacts(300);

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function generateContact(): Contact {
  return {
    name: `${sample(firstNames)} ${sample(lastNames)}`,
    phone: `${random(100, 999)}-${random(100, 999)}-${random(1000, 9999)}`,
    city: sample(cities),
    age: random(18, 100),
  };
}

function generateContacts(count: number): Contact[] {
  return Array.from({ length: count }, generateContact);
}

export default function Kensho(): JSX.Element {
  const [filters, setFilters] = useState<ContactFilters>(initialFilters);
  const [sortColumn, setSortColumn] = useState<ContactColumnKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterPopover, setFilterPopover] = useState<ContactColumnKey | null>(null);

  const handleFilterChange = (key: ContactColumnKey, value: string): void => {
    setFilters((previousFilters) => ({ ...previousFilters, [key]: value }));
  };

  const handleSort = (key: ContactColumnKey): void => {
    if (sortColumn === key) {
      setSortDirection((previousDirection) => (previousDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumn(key);
    setSortDirection("asc");
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      return columns.every(({ key }) => {
        const filterValue = filters[key];
        if (filterValue === "") {
          return true;
        }

        return String(contact[key]).toUpperCase().includes(filterValue.toUpperCase());
      });
    });
  }, [filters]);

  const sortedContacts = useMemo(() => {
    if (sortColumn === null) {
      return filteredContacts;
    }

    return [...filteredContacts].sort((leftContact, rightContact) => {
      const leftValue = leftContact[sortColumn];
      const rightValue = rightContact[sortColumn];
      const modifier = sortDirection === "asc" ? 1 : -1;

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return (leftValue - rightValue) * modifier;
      }

      return String(leftValue).localeCompare(String(rightValue)) * modifier;
    });
  }, [filteredContacts, sortColumn, sortDirection]);

  return (
    <div>
      <h2>Kensho - Contacts Table</h2>
      <p>A contacts table with sorting, filtering, and 300 mock contacts.</p>

      <div className="card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              {columns.map((column) => {
                const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
                  handleFilterChange(column.key, event.target.value);
                };

                return (
                  <th
                    key={column.key}
                    style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleSort(column.key)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "bold",
                          padding: 0,
                        }}
                      >
                        {column.name}
                        {sortColumn === column.key && (sortDirection === "asc" ? " ↑" : " ↓")}
                      </button>
                      <button
                        onClick={() =>
                          setFilterPopover((currentKey) =>
                            currentKey === column.key ? null : column.key,
                          )
                        }
                        style={{
                          background: filters[column.key] ? "#0066cc" : "#e0e0e0",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.25rem 0.5rem",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          color: filters[column.key] ? "#fff" : "#222",
                        }}
                      >
                        Filter
                      </button>
                    </div>
                    {filterPopover === column.key && (
                      <div
                        style={{
                          position: "absolute",
                          background: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "0.5rem",
                          marginTop: "0.5rem",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          zIndex: 10,
                        }}
                      >
                        <input
                          type="text"
                          value={filters[column.key]}
                          onChange={handleInputChange}
                          placeholder={`Filter ${column.name}...`}
                          autoFocus
                          style={{
                            padding: "0.5rem",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            width: "150px",
                          }}
                        />
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedContacts.slice(0, visibleRowCount).map((contact, index) => (
              <tr key={`${contact.phone}-${index}`} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.75rem" }}>{contact.name}</td>
                <td style={{ padding: "0.75rem" }}>{contact.phone}</td>
                <td style={{ padding: "0.75rem" }}>{contact.city}</td>
                <td style={{ padding: "0.75rem", textAlign: "center" }}>{contact.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Showing {visibleRowCount} of {sortedContacts.length} contacts
        </p>
      </div>
    </div>
  );
}