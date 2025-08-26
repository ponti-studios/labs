import { Move, ZoomIn, ZoomOut } from "lucide-react";
import type React from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";

interface ImageAdjustmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	image: string | null;
	imageScale: number;
	imagePosition: { x: number; y: number };
	imageEditorRef: React.RefObject<HTMLDivElement | null>;
	handleMouseDown: (e: React.MouseEvent) => void;
	handleMouseMove: (e: React.MouseEvent) => void;
	handleMouseUp: () => void;
	handleScaleChange: (value: number[]) => void;
	setImageScale: (value: number) => void;
	setImagePosition: (value: { x: number; y: number }) => void;
}

export function ImageAdjustmentDialog({
	open,
	onOpenChange,
	image,
	imageScale,
	imagePosition,
	imageEditorRef,
	handleMouseDown,
	handleMouseMove,
	handleMouseUp,
	handleScaleChange,
	setImageScale,
	setImagePosition,
}: ImageAdjustmentDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Adjust Image</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div
						ref={imageEditorRef}
						className="relative w-full aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden cursor-move"
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
					>
						{image && (
							<div
								style={{
									width: "100%",
									height: "100%",
									transform: `scale(${imageScale}) translate(${
										imagePosition.x / imageScale
									}px, ${imagePosition.y / imageScale}px)`,
									backgroundImage: `url(${image})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}
							/>
						)}

						<div className="absolute inset-0 pointer-events-none border-2 border-white border-dashed opacity-50" />

						<div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
							<Move className="h-3 w-3 inline mr-1" /> Drag to position
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between">
							<Label className="text-gray-700">Zoom</Label>
							<span className="text-xs text-gray-500">
								{Math.round(imageScale * 100)}%
							</span>
						</div>
						<div className="flex items-center gap-2">
							<ZoomOut className="h-4 w-4 text-gray-500" />
							<Slider
								min={1}
								max={3}
								step={0.05}
								value={[imageScale]}
								onValueChange={handleScaleChange}
								className="flex-1"
							/>
							<ZoomIn className="h-4 w-4 text-gray-500" />
						</div>
					</div>

					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setImageScale(1);
								setImagePosition({ x: 0, y: 0 });
							}}
						>
							Reset
						</Button>
						<Button onClick={() => onOpenChange(false)}>Done</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
