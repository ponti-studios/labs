import { useMemo, useState } from "react";

const mockBooks = [
  {
    uid: "OLID:1",
    title: "The Great Gatsby",
    authors: [{ name: "F. Scott Fitzgerald" }],
    cover: null,
  },
  { uid: "OLID:2", title: "To Kill a Mockingbird", authors: [{ name: "Harper Lee" }], cover: null },
  { uid: "OLID:3", title: "1984", authors: [{ name: "George Orwell" }], cover: null },
  { uid: "OLID:4", title: "Pride and Prejudice", authors: [{ name: "Jane Austen" }], cover: null },
  {
    uid: "OLID:5",
    title: "The Catcher in the Rye",
    authors: [{ name: "J.D. Salinger" }],
    cover: null,
  },
];

/**
 * Vendigo Take-Home Challenge
 *
 * Task: Build a book shop application with real-time search and filter functionality
 * using React state off a mocked list of books.
 */
export default function Vendigo() {
  const [books] = useState(mockBooks);
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize the filtered books to optimize performance, only recalculate when deps change
  const filteredBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.authors[0].name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [books, searchTerm],
  );

  return (
    <div>
      <h2>Vendigo - Book Shop</h2>
      <p>A book shop application with search functionality (from a React take-home test).</p>

      <div className="card">
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <h3 style={{ marginBottom: "1rem" }}>Featured</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {filteredBooks.map((book) => (
            <div
              key={book.uid}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "120px",
                  background: "#f0f0f0",
                  borderRadius: "4px",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                📚
              </div>
              <div
                className="red-text bold"
                style={{
                  fontSize: "0.9rem",
                  marginBottom: "0.25rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={book.title}
              >
                {book.title}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.5rem" }}>
                By <span className="red-text bold">{book.authors[0].name}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.75rem" }}>
                {book.uid.replace("OLID:", "")}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div className="text-center" style={{ flex: 1 }}>
                  ${(Math.random() * 100).toFixed(2)}
                </div>
                <button className="btn">Add To Cart</button>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <p style={{ textAlign: "center", color: "#666", padding: "2rem" }}>
            No books found matching "{searchTerm}"
          </p>
        )}
      </div>
    </div>
  );
}
