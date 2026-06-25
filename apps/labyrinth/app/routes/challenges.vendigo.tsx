import { Button, Input } from "@pontistudios/ui";
import { useState } from "react";

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

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.authors[0].name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <h2>Vendigo - Book Shop</h2>
      <p>A book shop application with search functionality (from a React take-home test).</p>

      <div className="card">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <h3 className="mb-4">Featured</h3>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {filteredBooks.map((book) => (
            <div key={book.uid} className="rounded-[8px] border border-[#ddd] p-4 text-center">
              <div className="mb-3 flex h-[120px] w-full items-center justify-center rounded-md bg-[#f0f0f0]">
                📚
              </div>
              <div
                className="red-text bold mb-1 overflow-hidden text-[0.9rem] text-ellipsis whitespace-nowrap"
                title={book.title}
              >
                {book.title}
              </div>
              <div className="mb-2 text-[0.85rem] text-[#666]">
                By{" "}
                <span className="red-text bold mb-1 overflow-hidden text-[0.9rem] text-ellipsis whitespace-nowrap">
                  {book.authors[0].name}
                </span>
              </div>
              <div className="mb-3 text-xs text-[#999]">{book.uid.replace("OLID:", "")}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-center">${(Math.random() * 100).toFixed(2)}</div>
                <Button>Add To Cart</Button>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <p className="p-8 text-center text-[#666]">No books found matching "{searchTerm}"</p>
        )}
      </div>
    </div>
  );
}
