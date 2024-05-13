import { MoreVertical } from "lucide-react";
import React, { type PropsWithChildren } from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import type { List } from "src/lib/types";
import ListEditSheet from "./list-edit-sheet";

const ListMenuContext = React.createContext<{
	isEditSheetOpen: boolean;
	setIsEditSheetOpen: (value: boolean) => void;
	isDeleteSheetOpen: boolean;
	setIsDeleteSheetOpen: (value: boolean) => void;
	openEditSheet: () => void;
}>({
	isEditSheetOpen: false,
	setIsEditSheetOpen: () => {},
	isDeleteSheetOpen: false,
	setIsDeleteSheetOpen: () => {},
	openEditSheet: () => {},
});

const ListMenuProvider = ({ children }: PropsWithChildren) => {
	const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false);
	const [isDeleteSheetOpen, setIsDeleteSheetOpen] = React.useState(false);

	const openEditSheet = () => {
		console.log("openEditSheet");
		setIsEditSheetOpen(true);
	};

	return (
		<ListMenuContext.Provider
			value={{
				isEditSheetOpen,
				setIsEditSheetOpen,
				isDeleteSheetOpen,
				setIsDeleteSheetOpen,
				openEditSheet,
			}}
		>
			{children}
		</ListMenuContext.Provider>
	);
};

export function useListMenu() {
	return React.useContext(ListMenuContext);
}

type ListMenuProps = {
	list: List & { createdBy: { email: string } };
	isOwnList: boolean;
};
export function ListMenu({ list, isOwnList }: ListMenuProps) {
	const { openEditSheet, setIsDeleteSheetOpen } = useListMenu();

	if (!isOwnList) {
		return null;
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<MoreVertical />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						className="p-2"
						onClick={() => {
							console.log("Edit");
							openEditSheet();
						}}
					>
						Edit
					</DropdownMenuItem>
					{/* <DropdownMenuItem
						className="p-2"
						onClick={() => setIsDeleteSheetOpen(true)}
					>
						Delete
					</DropdownMenuItem> */}
				</DropdownMenuContent>
			</DropdownMenu>
			<ListEditSheet list={list} />
		</>
	);
}

export default function ListMenuWithProvider(props: ListMenuProps) {
	return (
		<ListMenuProvider>
			<ListMenu {...props} />
		</ListMenuProvider>
	);
}
