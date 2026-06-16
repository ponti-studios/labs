import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pontistudios/ui";
import { useMemo, useState } from "react";

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

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Contact {
  name: string;
  phone: string;
  city: string;
  age: number;
}
type FilterState = Record<keyof Contact, string>;

function generateContact(): Contact {
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

function generateContacts(n: number): Contact[] {
  return Array.from({ length: n }, generateContact);
}

const contacts = generateContacts(300);

/**
 * Kensho Take-Home Challenge
 *
 * Task: Create a highly performant mapping and rendering component for filtering
 * and searching through large datasets of first names, last names, and cities.
 */
export default function Kensho() {
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    phone: "",
    city: "",
    age: "",
  });
  const [sortColumn, setSortColumn] = useState<keyof Contact | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterPopover, setFilterPopover] = useState<keyof Contact | null>(null);

  const handleFilterChange = (key: keyof Contact, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (key: keyof Contact) => {
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
        const filterValue = filters[key as keyof FilterState];
        if (filterValue === "") return true;
        return String(contact[key as keyof Contact])
          .toUpperCase()
          .includes(filterValue.toUpperCase());
      });
    });
  }, [filters]);

  const sortedContacts = useMemo(() => {
    if (!sortColumn) return filteredContacts;
    return [...filteredContacts].sort((a, b) => {
      const aVal = a[sortColumn as keyof Contact] as any;
      const bVal = b[sortColumn as keyof Contact] as any;
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (typeof aVal === "number") return (aVal - bVal) * modifier;
      return String(aVal).localeCompare(String(bVal)) * modifier;
    });
  }, [filteredContacts, sortColumn, sortDirection]);

  return (
    <div>
      <h2>Kensho - Contacts Table</h2>
      <p>A contacts table with sorting, filtering, and 300 mock contacts.</p>

      <div className="card">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow className="bg-[#f5f5f5]">
              {columns.map((col) => (
                <TableHead key={col.key} className="p-3 text-left border-b-2 border-[#ddd]">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleSort(col.key as keyof Contact)}
                      className="bg-transparent border-none cursor-pointer font-bold p-0"
                    >
                      {col.name}
                      {sortColumn === col.key && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </Button>
                    <Button
                      onClick={() =>
                        setFilterPopover(
                          filterPopover === col.key ? null : (col.key as keyof Contact),
                        )
                      }
                      className={`border-none rounded-md px-2 py-1 cursor-pointer text-xs ${filters[col.key as keyof Contact] ? "bg-[#0066cc]" : "bg-[#e0e0e0]"}`}
                    >
                      �-filter
                    </Button>
                  </div>
                  {filterPopover === col.key && (
                    <div className="absolute bg-white border border-[#ccc] rounded-md p-2 mt-2 shadow-[0_2px_8px_rgba(0,0,0,0.15)] z-10">
                      <Input
                        type="text"
                        value={filters[col.key as keyof Contact]}
                        onChange={(e) =>
                          handleFilterChange(col.key as keyof Contact, e.target.value)
                        }
                        placeholder={`Filter ${col.name}...`}
                        autoFocus
                      />
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContacts.slice(0, 50).map((contact, idx) => (
              <TableRow key={contact.phone + idx} className="border-b border-[#eee]">
                <TableCell className="p-3">{contact.name}</TableCell>
                <TableCell className="p-3">{contact.phone}</TableCell>
                <TableCell className="p-3">{contact.city}</TableCell>
                <TableCell className="p-3 text-center">{contact.age}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-4 text-[#666]">Showing 50 of {sortedContacts.length} contacts</p>
      </div>
    </div>
  );
}
