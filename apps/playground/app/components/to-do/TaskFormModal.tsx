import { useEffect, useState } from "react";
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
import { Select } from "~/components/ui/select";
import { useProjects } from "~/lib/projects";
import type { TodoCreateData, TodoItem } from "~/lib/todos";

interface TaskFormModalProps {
	onSubmit: (todo: TodoCreateData | TodoItem) => void;
	isLoading?: boolean;
	trigger?: React.ReactNode;
	todo?: TodoItem; // For editing mode
	open?: boolean; // For controlled open state
	onOpenChange?: (open: boolean) => void; // For controlled open state
}

export function TaskFormModal({
	onSubmit,
	isLoading = false,
	trigger,
	todo,
	open: controlledOpen,
	onOpenChange,
}: TaskFormModalProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const [formData, setFormData] = useState({
		projectId: "",
		title: "",
		start: "",
		end: "",
	});

	const isEditing = !!todo;
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setOpen = onOpenChange || setInternalOpen;

	const { data: projects = [], isLoading: projectsLoading } = useProjects();

	// Initialize form data when editing
	useEffect(() => {
		if (todo) {
			setFormData({
				projectId: todo.projectId?.toString() || "",
				title: todo.title,
				start: todo.start,
				end: todo.end,
			});
		}
	}, [todo]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.projectId || !formData.title) return;

		const projectId = Number.parseInt(formData.projectId);
		if (isNaN(projectId)) {
			alert("Please select a valid project");
			return;
		}

		const startDate = new Date(
			formData.start || new Date().toISOString().split("T")[0],
		);
		const endDate = new Date(formData.end || startDate);
		const duration = Math.max(
			1,
			Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
			) + 1,
		);

		if (isEditing && todo) {
			// Update existing todo
			const updatedTodo: TodoItem = {
				...todo,
				projectId: projectId,
				title: formData.title,
				start: formData.start || new Date().toISOString().split("T")[0],
				end: formData.end || new Date().toISOString().split("T")[0],
			};
			onSubmit(updatedTodo);
		} else {
			// Create new todo
			const newTodo: TodoCreateData = {
				projectId: projectId,
				title: formData.title,
				start: formData.start || new Date().toISOString().split("T")[0],
				end: formData.end || new Date().toISOString().split("T")[0],
				completed: false,
			};
			onSubmit(newTodo);
		}

		if (!isEditing) {
			setFormData({ projectId: "", title: "", start: "", end: "" });
		}
		setOpen(false);
	};

	const handleCancel = () => {
		if (!isEditing) {
			setFormData({ projectId: "", title: "", start: "", end: "" });
		}
		setOpen(false);
	};

	const dialogContent = (
		<DialogContent className="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>{isEditing ? "Edit Todo" : "Add New Todo"}</DialogTitle>
				<DialogDescription>
					{isEditing
						? "Update the todo details below."
						: "Create a new todo item. Fill in the details below."}
				</DialogDescription>
			</DialogHeader>
			<form onSubmit={handleSubmit}>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="project" className="text-right">
							Project
						</Label>
						<Select
							id="project"
							value={formData.projectId}
							onChange={(e) =>
								setFormData({ ...formData, projectId: e.target.value })
							}
							className="col-span-3"
							required
							disabled={projectsLoading}
							aria-describedby="project-error"
						>
							<option value="">Select a project</option>
							{projects.map((project) => (
								<option key={project.id} value={project.id}>
									{project.name}
								</option>
							))}
						</Select>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="title" className="text-right">
							Title
						</Label>
						<Input
							id="title"
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							className="col-span-3"
							placeholder="Enter task title"
							required
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="start" className="text-right">
							Start Date
						</Label>
						<Input
							id="start"
							type="date"
							value={formData.start}
							onChange={(e) =>
								setFormData({ ...formData, start: e.target.value })
							}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="end" className="text-right">
							End Date
						</Label>
						<Input
							id="end"
							type="date"
							value={formData.end}
							onChange={(e) =>
								setFormData({ ...formData, end: e.target.value })
							}
							className="col-span-3"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading || projectsLoading}>
						{isLoading
							? isEditing
								? "Updating..."
								: "Adding..."
							: isEditing
								? "Update Todo"
								: "Add Todo"}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);

	// If controlled (for editing), render without trigger
	if (controlledOpen !== undefined) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				{dialogContent}
			</Dialog>
		);
	}

	// If uncontrolled (for creating), render with trigger
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || <Button size="sm">Add New Todo</Button>}
			</DialogTrigger>
			{dialogContent}
		</Dialog>
	);
}
