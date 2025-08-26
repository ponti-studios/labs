import { useMutation } from "@tanstack/react-query";
import { Plus, ThumbsDown, ThumbsUp, Trash2, User } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "~/components/ui/drawer";
import { TRACKER_PHOTO_BUCKET } from "~/lib/consts";
import { supabase } from "~/lib/supabaseClient";
import { useIsMobile } from "~/lib/use-is-mobile";
import "../voter/pokemon-card.css";

function usePhotoUpload() {
	return useMutation({
		mutationFn: async (file: File) => {
			const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
			const { data, error } = await supabase.storage
				.from(TRACKER_PHOTO_BUCKET)
				.upload(fileName, file, { cacheControl: "3600", upsert: false });
			if (error) throw error;
			const { data: publicUrlData } = supabase.storage
				.from("tracker-photos")
				.getPublicUrl(data.path);
			if (!publicUrlData || !publicUrlData.publicUrl) {
				throw new Error("Could not get public URL for the uploaded photo.");
			}
			return publicUrlData.publicUrl as string;
		},
	});
}

interface CreateTrackerFormProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	titleId?: string;
	onTrackerCreate: (newTracker: {
		name: string;
		pros: string[];
		cons: string[];
		photo_url?: string;
	}) => void;
}

export function CreateTrackerForm({
	isOpen,
	onClose,
	title,
	description,
	titleId = "dialog-title",
	onTrackerCreate,
}: CreateTrackerFormProps) {
	const { isMobile } = useIsMobile();
	const photoUpload = usePhotoUpload();

	// --- Form State ---
	const [photoPreview, setPhotoPreview] = useState<string | undefined>(
		undefined,
	);
	const [photoFile, setPhotoFile] = useState<File | undefined>(undefined);
	const [name, setName] = useState("");
	const [pros, setPros] = useState<string[]>([""]);
	const [cons, setCons] = useState<string[]>([""]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	// Stable keys for pros/cons
	const prosKeys = useRef<string[]>([]);
	const consKeys = useRef<string[]>([]);
	if (prosKeys.current.length !== pros.length) {
		// Add or remove keys to match pros length
		while (prosKeys.current.length < pros.length) {
			prosKeys.current.push(crypto.randomUUID());
		}
		while (prosKeys.current.length > pros.length) {
			prosKeys.current.pop();
		}
	}
	if (consKeys.current.length !== cons.length) {
		while (consKeys.current.length < cons.length) {
			consKeys.current.push(crypto.randomUUID());
		}
		while (consKeys.current.length > cons.length) {
			consKeys.current.pop();
		}
	}

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		setUploadError(null);
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				setUploadError("File is too large. Maximum size is 5MB.");
				setPhotoFile(undefined);
				setPhotoPreview(undefined);
				e.target.value = "";
				return;
			}
			if (
				!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
					file.type,
				)
			) {
				setUploadError(
					"Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP).",
				);
				setPhotoFile(undefined);
				setPhotoPreview(undefined);
				e.target.value = "";
				return;
			}
			setPhotoFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPhotoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setPhotoFile(undefined);
			setPhotoPreview(undefined);
		}
	};

	const handleProChange = (index: number, value: string) => {
		const newPros = [...pros];
		newPros[index] = value;
		setPros(newPros);
	};
	const handleConChange = (index: number, value: string) => {
		const newCons = [...cons];
		newCons[index] = value;
		setCons(newCons);
	};
	const addPro = () => setPros([...pros, ""]);
	const addCon = () => setCons([...cons, ""]);
	const removePro = (index: number) => {
		if (pros.length <= 1) return;
		const newPros = [...pros];
		newPros.splice(index, 1);
		setPros(newPros);
	};
	const removeCon = (index: number) => {
		if (cons.length <= 1) return;
		const newCons = [...cons];
		newCons.splice(index, 1);
		setCons(newCons);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !pros[0] || !cons[0] || isSubmitting) return;
		if (uploadError) return;
		setIsSubmitting(true);
		setUploadError(null);
		let photo_url: string | undefined = undefined;
		if (photoFile) {
			try {
				photo_url = await photoUpload.mutateAsync(photoFile);
			} catch (error: any) {
				console.error("Error uploading photo:", error);
				setUploadError(`Photo upload failed: ${error.message}`);
				setIsSubmitting(false);
				return;
			}
		}
		const filteredPros = pros.filter((pro) => pro.trim() !== "");
		const filteredCons = cons.filter((con) => con.trim() !== "");
		onTrackerCreate({
			name,
			pros: filteredPros,
			cons: filteredCons,
			photo_url,
		});
	};

	const form = (
		<form onSubmit={handleSubmit} className="pokemon-card space-y-4 p-1">
			<div className="pokemon-card-image">
				{photoPreview ? (
					<img
						src={photoPreview}
						alt="Preview"
						className="w-32 h-32 object-cover rounded-lg shadow-md"
					/>
				) : (
					<div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
						<User size={40} className="text-blue-500" />
					</div>
				)}
			</div>
			<div className="pokemon-card-content space-y-4">
				<div className="space-y-2">
					<label
						htmlFor="tracker-photo"
						className="block text-sm font-bold text-gray-800"
					>
						Photo (Optional, max 5MB)
					</label>
					<input
						id="tracker-photo"
						type="file"
						accept="image/jpeg,image/png,image/gif,image/webp"
						onChange={handlePhotoChange}
						className="pokemon-card-file-input"
					/>
					{uploadError && (
						<p className="mt-2 text-sm text-red-600 font-medium">
							{uploadError}
						</p>
					)}
				</div>
				<div>
					<label
						htmlFor="tracker-name"
						className="block text-sm font-bold text-gray-800"
					>
						Their Name
					</label>
					<input
						id="tracker-name"
						type="text"
						placeholder="e.g., Alex"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className="pokemon-card-input"
					/>
				</div>
				<div className="space-y-2">
					<div className="flex items-center">
						<ThumbsUp size={18} className="mr-2 text-green-600" />
						<h4 className="block text-sm font-bold text-gray-800">
							The Good (Pros)
						</h4>
					</div>
					{pros.map((pro, index) => (
						<div
							key={prosKeys.current[index]}
							className="flex items-center mb-2"
						>
							<input
								type="text"
								placeholder={
									index === 0
										? "Pro #1 (required)"
										: `Pro #${index + 1} (optional)`
								}
								value={pro}
								onChange={(e) => handleProChange(index, e.target.value)}
								required={index === 0}
								className="pokemon-card-input flex-grow"
							/>
							{pros.length > 1 && (
								<button
									type="button"
									onClick={() => removePro(index)}
									className="ml-2 text-red-500 hover:text-red-700"
									aria-label="Remove pro"
								>
									<Trash2 size={16} />
								</button>
							)}
						</div>
					))}
					<button
						type="button"
						onClick={addPro}
						className="flex items-center text-sm text-green-600 hover:text-green-800 mt-1"
						aria-label="Add another pro"
						disabled={pros.length >= 5}
					>
						<Plus size={16} className="mr-1" /> Add another pro
					</button>
				</div>
				<div className="space-y-2">
					<div className="flex items-center">
						<ThumbsDown size={18} className="mr-2 text-red-600" />
						<h4 className="block text-sm font-bold text-gray-800">
							The Bad (Cons)
						</h4>
					</div>
					{cons.map((con, index) => (
						<div
							key={consKeys.current[index]}
							className="flex items-center mb-2"
						>
							<input
								type="text"
								placeholder={
									index === 0
										? "Con #1 (required)"
										: `Con #${index + 1} (optional)`
								}
								value={con}
								onChange={(e) => handleConChange(index, e.target.value)}
								required={index === 0}
								className="pokemon-card-input flex-grow"
							/>
							{cons.length > 1 && (
								<button
									type="button"
									onClick={() => removeCon(index)}
									className="ml-2 text-red-500 hover:text-red-700"
									aria-label="Remove con"
								>
									<Trash2 size={16} />
								</button>
							)}
						</div>
					))}
					<button
						type="button"
						onClick={addCon}
						className="flex items-center text-sm text-red-600 hover:text-red-800 mt-1"
						aria-label="Add another con"
						disabled={cons.length >= 5}
					>
						<Plus size={16} className="mr-1" /> Add another con
					</button>
				</div>
				<div className="pokemon-card-stats">
					<p className="font-medium text-xs">
						HP <span className="float-right font-bold">??/150</span>
					</p>
					<div className="hp-bar-container">
						<div
							className="hp-bar-glow hp-bar-neutral hp-bar-animated"
							style={{ width: "50%" }}
						/>
					</div>
					<p className="mt-2 text-xs italic">
						HP will be calculated based on friends' votes!
					</p>
				</div>
				<div className="flex justify-end space-x-3 pt-2">
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="px-4 py-2 text-sm font-medium bg-gray-300 hover:bg-gray-400 rounded-full shadow-sm focus:outline-none disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={
							!name || !pros[0] || !cons[0] || isSubmitting || !!uploadError
						}
						className="pokemon-card-button"
					>
						{isSubmitting ? "Creating..." : "Create Tracker"}
					</button>
				</div>
			</div>
		</form>
	);

	if (isMobile) {
		return (
			<Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle id={titleId}>{title}</DrawerTitle>
						{description && (
							<DrawerDescription>{description}</DrawerDescription>
						)}
					</DrawerHeader>
					<div className="px-4 pb-4 pokemon-card-dialog-content">{form}</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="pokemon-card-dialog">
				<DialogHeader className="pokemon-card-dialog-header">
					<DialogTitle id={titleId}>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				<div className="pokemon-card-dialog-content">{form}</div>
			</DialogContent>
		</Dialog>
	);
}
