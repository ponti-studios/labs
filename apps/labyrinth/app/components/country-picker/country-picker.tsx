"use client";

import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@pontistudios/ui";
import { useQuery } from "@tanstack/react-query";
import iso3166 from "iso-3166-1";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import { cn } from "~/lib/utils";

function countryFlag(alpha3: string): string {
  // Look up the ISO 3166-1 entry by alpha-3 code (e.g. "USA") to get the alpha-2 code ("US")
  // needed for flag emoji generation — OWID uses alpha-3, but flag emojis are keyed on alpha-2.
  const entry = iso3166.whereAlpha3(alpha3);
  if (!entry) return "🏳";

  // Flag emojis are pairs of Unicode "Regional Indicator" characters, one per letter of the
  // alpha-2 code. Regional Indicators start at U+1F1E6 ("A"), so the offset from plain ASCII
  // 'A' (65) to the Regional Indicator 'A' is 0x1F1E6 − 65.
  const flagBase = 0x1f1e6 - 65;

  // Split the two-letter code, shift each character from its ASCII code point into the
  // Regional Indicator block, then join — the OS/browser renders the pair as a single flag emoji.
  return [...entry.alpha2.toUpperCase()]
    .map((c) => String.fromCodePoint(flagBase + c.charCodeAt(0)))
    .join("");
}

type Country = {
  name: string;
  code: string;
};

type CountryPickerProps = {
  readonly onChange: (val: string) => void;
  readonly countryCode: string;
  readonly className?: string;
};

export function CountryPicker({ onChange, countryCode, className }: CountryPickerProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery<{ data: Country[]; total: number }>({
    queryKey: ["countries-list"],
    queryFn: () => fetch("/api/countries/list").then((res) => res.json()),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour since countries don't change often
  });

  const countries = response?.data || [];

  const selectedCountry = countries.find((country) => country.code === countryCode);

  const handleSelect = useCallback(
    (currentValue: string) => {
      onChange(currentValue);
      setOpen(false);
      setSearchValue("");
    },
    [onChange],
  );

  const getCountryFlag = (code: string) => {
    return <span>{countryFlag(code)}</span>;
  };

  if (isLoading) {
    return (
      <Button variant="outline" className={cn("h-10 w-full justify-between", className)} disabled>
        <span className="flex items-center">
          <div className="mr-2 size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <span className="text-gray-600">Loading countries...</span>
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-30" />
      </Button>
    );
  }

  if (isError) {
    return (
      <Button
        variant="outline"
        className={cn(
          "h-10 w-full justify-between border-red-200 bg-red-50 hover:bg-red-50",
          className,
        )}
        disabled
      >
        <span className="flex items-center text-red-600">
          <div className="mr-2 h-4 w-4 text-red-500">⚠</div>
          <span className="truncate">
            Error: {error instanceof Error ? error.message : "Failed to load"}
          </span>
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-red-400 opacity-30" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="flex items-center gap-2 text-black">
            {selectedCountry ? (
              <>
                {getCountryFlag(selectedCountry.code)}
                <span>{selectedCountry.name}</span>
              </>
            ) : (
              <>
                <Search className="size-4" />
                Select country...
              </>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" side="bottom" avoidCollisions={false}>
        <Command>
          <CommandInput
            placeholder="Search countries..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No countries found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code}`}
                  onSelect={() => handleSelect(country.code)}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center">
                    {getCountryFlag(country.code)}
                    <span className="ml-2">{country.name}</span>
                  </span>
                  <span className="flex items-center">
                    {country.code !== "OWID_WRL" && (
                      <span className="ml-auto text-xs text-gray-500">{country.code}</span>
                    )}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        countryCode === country.code ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
