"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Globe, Search } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
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
} from "~/components/ui";
import { cn } from "~/lib/utils";

type Country = {
	name: string;
	code: string;
};

type CountryPickerProps = {
	readonly onChange: (val: string) => void;
	readonly countryCode: string;
	readonly className?: string;
};

export function CountryPicker({
	onChange,
	countryCode,
	className,
}: CountryPickerProps): ReactNode {
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

	const selectedCountry = countries.find(
		(country) => country.code === countryCode,
	);

	const handleSelect = useCallback(
		(currentValue: string) => {
			onChange(currentValue);
			setOpen(false);
			setSearchValue("");
		},
		[onChange],
	);

	const getCountryFlag = (countryCode: string) => {
		if (countryCode === "OWID_WRL") {
			return <Globe className="w-4 h-4" />;
		}
		// For real country codes, we could use flag emojis or flag icons
		// For now, just show a generic icon
		return <span className="w-4 h-4 text-gray-400">🏴</span>;
	};

	if (isLoading) {
		return (
			<Button
				variant="outline"
				className={cn("w-full justify-between h-10", className)}
				disabled
			>
				<span className="flex items-center">
					<div className="w-4 h-4 mr-2 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full" />
					<span className="text-gray-600">Loading countries...</span>
				</span>
				<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-30" />
			</Button>
		);
	}

	if (isError) {
		return (
			<Button
				variant="outline"
				className={cn(
					"w-full justify-between h-10 border-red-200 bg-red-50 hover:bg-red-50",
					className,
				)}
				disabled
			>
				<span className="flex items-center text-red-600">
					<div className="w-4 h-4 mr-2 text-red-500">⚠</div>
					<span className="truncate">
						Error: {error instanceof Error ? error.message : "Failed to load"}
					</span>
				</span>
				<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-30 text-red-400" />
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
					<span className="flex items-center text-black">
						{selectedCountry ? (
							<>
								{getCountryFlag(selectedCountry.code)}
								<span className="ml-2">{selectedCountry.name}</span>
							</>
						) : (
							<>
								<Search className="w-4 h-4 mr-2" />
								Select country...
							</>
						)}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
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
											<span className="ml-auto text-xs text-gray-500">
												{country.code}
											</span>
										)}
										<Check
											className={cn(
												"ml-auto h-4 w-4",
												countryCode === country.code
													? "opacity-100"
													: "opacity-0",
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

export default CountryPicker;
