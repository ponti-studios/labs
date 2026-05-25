import { useState, useMemo } from "react";

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
];

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
];

const cities = ["Cambridge, MA", "New York, NY", "McLean, VA", "Pacific Palisades, CA"];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateContact() {
  const age = random(18, 100);
  return {
    name: `${sample(firstNames)} ${sample(lastNames)}`,
    phone: `${random(100, 999)}-${random(100, 999)}-${random(1000, 9999)}`,
    city: sample(cities),
    age,
  };
}

const columns = [
  { name: "Name", key: "name", type: "string" },
  { name: "Phone Number", key: "phone", type: "string" },
  { name: "City", key: "city", type: "category" },
  { name: "Age", key: "age", type: "number" },
];

function generateContacts(n) {
  return Array.from({ length: n }, generateContact);
}

const contacts = generateContacts(300);

export default function Kensho() {
  const [filters, setFilters] = useState({
    name: "",
    phone: "",
    city: "",
    age: "",
  });
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterPopover, setFilterPopover] = useState(null);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      return Object.keys(filters).every((key) => {
        const filterValue = filters[key];
        if (filterValue === "") return true;
        return contact[key].toString().toUpperCase().includes(filterValue.toUpperCase());
      });
    });
  }, [filters]);

  const sortedContacts = useMemo(() => {
    if (!sortColumn) return filteredContacts;
    return [...filteredContacts].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (typeof aVal === "number") return (aVal - bVal) * modifier;
      return aVal.localeCompare(bVal) * modifier;
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
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleSort(col.key)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        padding: 0,
                      }}
                    >
                      {col.name}
                      {sortColumn === col.key && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </button>
                    <button
                      onClick={() => setFilterPopover(filterPopover === col.key ? null : col.key)}
                      style={{
                        background: filters[col.key] ? "#0066cc" : "#e0e0e0",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      �-filter
                    </button>
                  </div>
                  {filterPopover === col.key && (
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
                        value={filters[col.key]}
                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                        placeholder={`Filter ${col.name}...`}
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
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedContacts.slice(0, 50).map((contact, idx) => (
              <tr key={contact.phone + idx} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.75rem" }}>{contact.name}</td>
                <td style={{ padding: "0.75rem" }}>{contact.phone}</td>
                <td style={{ padding: "0.75rem" }}>{contact.city}</td>
                <td style={{ padding: "0.75rem", textAlign: "center" }}>{contact.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Showing 50 of {sortedContacts.length} contacts
        </p>
      </div>
    </div>
  );
}
