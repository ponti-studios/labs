import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { ProjectCreateData } from "~/lib/projects";
import { useCreateProject } from "~/lib/projects";

interface ProjectFormModalProps {
	onSubmit?: (project: ProjectCreateData) => void;
	isLoading?: boolean;
	trigger?: React.ReactNode;
}

export function ProjectFormModal({
	onSubmit,
	isLoading: externalLoading = false,
	trigger,
}: ProjectFormModalProps) {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});

	const createProjectMutation = useCreateProject();
	const isLoading = externalLoading || createProjectMutation.isPending;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) return;

		const newProject: ProjectCreateData = {
			name: formData.name.trim(),
			description: formData.description.trim() || null,
		};

		if (onSubmit) {
			onSubmit(newProject);
		} else {
			createProjectMutation.mutate(newProject);
		}

		setFormData({ name: "", description: "" });
		setOpen(false);
	};

	const handleCancel = () => {
		setFormData({ name: "", description: "" });
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<PlusIcon /> New Project
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Project</DialogTitle>
					<DialogDescription>
						Create a new project to organize your todos. Fill in the details
						below.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name
							</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="col-span-3"
								placeholder="Enter project name"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="description" className="text-right">
								Description
							</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								className="col-span-3"
								placeholder="Enter project description (optional)"
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleCancel}>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Creating..." : "Create Project"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
