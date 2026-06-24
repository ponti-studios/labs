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
import { LucideSearch, LucideX } from "lucide-react";
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
  const [sortColumn, setSortColumn] = useState<keyof Contact | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSort = (key: keyof Contact) => {
    if (sortColumn === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const query = searchQuery.toUpperCase();
    return contacts.filter((contact) =>
      Object.values(contact).some((value) => String(value).toUpperCase().includes(query)),
    );
  }, [searchQuery]);

  const sortedContacts = useMemo(() => {
    if (!sortColumn) return filteredContacts;
    return [...filteredContacts].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * modifier;
      return String(aVal).localeCompare(String(bVal)) * modifier;
    });
  }, [filteredContacts, sortColumn, sortDirection]);

  const hasActiveFilters = searchQuery.length > 0;

  return (
    <div>
      <div className="mb-6">
        <h2>Contacts</h2>
        <p className="text-muted-foreground">
          {contacts.length} contacts — sort by clicking a column header or search across all fields
          below.
        </p>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <LucideSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            className="w-full pr-9 pl-9"
            placeholder="Search name, phone, city, age…"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {hasActiveFilters && (
            <button
              aria-label="Clear search"
              className="text-muted-foreground hover:bg-muted absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-1 transition-colors"
              onClick={() => setSearchQuery("")}
              type="button"
            >
              <LucideX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="border-border rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>
                  <button
                    className="text-foreground hover:text-foreground/70 flex w-full cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-medium transition-colors"
                    onClick={() => handleSort(col.key as keyof Contact)}
                    type="button"
                  >
                    {col.name}
                    {sortColumn === col.key ? (
                      <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    ) : (
                      <span className="text-muted-foreground/30 text-xs">↑↓</span>
                    )}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground py-12 text-center"
                >
                  No contacts match &ldquo;{searchQuery}&rdquo;
                </TableCell>
              </TableRow>
            ) : (
              sortedContacts.slice(0, 50).map((contact, idx) => (
                <TableRow key={contact.phone + idx}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.city}</TableCell>
                  <TableCell className="text-center">{contact.age}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="border-border text-muted-foreground flex items-center justify-end border-t px-4 py-2 text-sm">
          {hasActiveFilters && (
            <Button type="button" onClick={() => setSearchQuery("")}>
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
