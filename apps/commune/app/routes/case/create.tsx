import type React from "react";
import { Camera, ChevronDown, X, ZoomIn } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Button, Input, Slider } from "@pontistudios/ui";
import { AttacksForm } from "~/components/verdict/attacks-form";
import { COLOR_THEMES } from "~/components/verdict/card-theme-picker";
import { FlawsPicker } from "~/components/verdict/flaws-picker";
import { ImageAdjustmentDialog } from "~/components/verdict/image-adjustment-dialog";
import { PersonCardDisplay } from "~/components/verdict/person-card-display";
import { PERSONALITY_TYPES } from "~/components/verdict/personality-type-picker";
import { cn } from "~/lib/utils";

const STRENGTHS = [
  "patient", "supportive", "honest", "generous", "communicative",
  "trustworthy", "affectionate", "respectful", "understanding", "reliable",
];

const THEME_COLORS: Record<string, string> = {
  classic: "#EAB308",
  galaxy: "#A855F7",
  fire: "#F97316",
  water: "#3B82F6",
  forest: "#22C55E",
};

export default function CreatePage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cardType, setCardType] = useState("");
  const [colorTheme, setColorTheme] = useState("classic");
  const [hp, setHp] = useState("100");
  const [commitmentLevel, setCommitmentLevel] = useState("3");
  const [flaws, setFlaws] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [attacks, setAttacks] = useState([
    { name: "", damage: 50 },
    { name: "", damage: 50 },
  ]);

  const [image, setImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageAdjustmentOpen, setImageAdjustmentOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageEditorRef = useRef<HTMLDivElement | null>(null);

  const visibleTypes = showAllTypes ? PERSONALITY_TYPES : PERSONALITY_TYPES.slice(0, 9);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
      setImageAdjustmentOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setSelectedImageFile(null);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageEditorRef.current) return;
    const bounds = imageEditorRef.current.getBoundingClientRect();
    const maxX = ((imageScale - 1) * bounds.width) / 2;
    const maxY = ((imageScale - 1) * bounds.height) / 2;
    setImagePosition({
      x: Math.max(-maxX, Math.min(maxX, e.clientX - dragStart.x)),
      y: Math.max(-maxY, Math.min(maxY, e.clientY - dragStart.y)),
    });
  };

  const handleScaleChange = (value: number[]) => {
    const newScale = value[0];
    setImageScale(newScale);
    if (imageEditorRef.current) {
      const bounds = imageEditorRef.current.getBoundingClientRect();
      const maxX = ((newScale - 1) * bounds.width) / 2;
      const maxY = ((newScale - 1) * bounds.height) / 2;
      setImagePosition({
        x: Math.max(-maxX, Math.min(maxX, imagePosition.x)),
        y: Math.max(-maxY, Math.min(maxY, imagePosition.y)),
      });
    }
  };

  const handleAttackChange = (index: number, field: "name" | "damage", value: string) => {
    setAttacks((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: field === "damage" ? Number(value) : value } : a)),
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setSaveError("Name is required.");
      return;
    }
    setSaveError(null);
    setIsSaving(true);

    let finalPhotoUrl = image;

    if (selectedImageFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedImageFile);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error((await res.json()).error || "Upload failed");
        finalPhotoUrl = (await res.json()).url;
      } catch (err: any) {
        setSaveError(`Image upload failed: ${err.message}`);
        setIsSaving(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          hp,
          cardType: cardType || null,
          description: description.trim() || null,
          attacks: attacks.filter((a) => a.name).map((a) => ({ name: a.name, damage: Number(a.damage) })),
          strengths,
          flaws,
          commitmentLevel,
          colorTheme,
          photoUrl: finalPhotoUrl,
          imageScale,
          imagePosition,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
      const data = await res.json();
      const owned = JSON.parse(localStorage.getItem("commune:owned") ?? "[]");
      localStorage.setItem("commune:owned", JSON.stringify([...owned, data.id]));
      navigate(`/case/${data.id}`);
    } catch (err: any) {
      setSaveError(`Something went wrong: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTheme = COLOR_THEMES.find((t) => t.value === colorTheme) ?? COLOR_THEMES[0];
  const selectedType = PERSONALITY_TYPES.find((t) => t.value === cardType) ?? PERSONALITY_TYPES[0];
  const cardData = { name: name || "Their name", hp, cardType, description, attacks, flaws, strengths, commitmentLevel };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

      {/* Form */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-lg font-semibold">Add someone to your roster</h1>
          <p className="text-sm text-muted-foreground mt-1">Your friends will weigh in anonymously.</p>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Their name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jordan"
            className="text-sm"
          />
        </div>

        {/* Photo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Photo <span className="normal-case font-normal">— optional</span>
          </label>
          {image ? (
            <div className="relative w-full max-w-[160px] aspect-square">
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div
                  style={{
                    width: "100%", height: "100%", overflow: "hidden",
                    transform: `scale(${imageScale}) translate(${imagePosition.x / imageScale}px, ${imagePosition.y / imageScale}px)`,
                    backgroundImage: `url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>
              <div className="absolute -top-2 -right-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setImageAdjustmentOpen(true)}
                  className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <ZoomIn size={11} />
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <X size={11} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-xl p-6 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Camera size={20} />
              <span className="text-xs">Upload a photo</span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">What's the vibe?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. super spontaneous, always planning the next trip..."
            rows={3}
            className="w-full text-sm border border-input rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        {/* Personality type */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Their type</label>
          <div className="flex flex-wrap gap-2">
            {visibleTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setCardType(type.value)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-colors",
                  cardType === type.value
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
                )}
              >
                {type.label}
              </button>
            ))}
            {!showAllTypes && (
              <button
                type="button"
                onClick={() => setShowAllTypes(true)}
                className="text-xs px-3 py-1.5 rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                + more
              </button>
            )}
          </div>
        </div>

        {/* Color theme */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Card color</label>
          <div className="flex gap-3">
            {COLOR_THEMES.map((theme) => (
              <button
                key={theme.value}
                type="button"
                onClick={() => setColorTheme(theme.value)}
                title={theme.label}
                className={cn(
                  "w-6 h-6 rounded-full transition-all",
                  colorTheme === theme.value ? "ring-2 ring-offset-2 ring-foreground" : "",
                )}
                style={{ background: THEME_COLORS[theme.value] }}
              />
            ))}
          </div>
        </div>

        {/* More details collapsible */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowMoreDetails((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <span>More details — flaws, strengths, qualities</span>
            <ChevronDown
              size={15}
              className={cn("transition-transform", showMoreDetails ? "rotate-180" : "")}
            />
          </button>

          {showMoreDetails && (
            <div className="px-4 pb-4 flex flex-col gap-5 border-t border-border pt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Relationship health (HP)
                </label>
                <div className="flex items-center gap-3">
                  <Slider
                    min={10} max={300} step={10}
                    value={[Number(hp)]}
                    onValueChange={(v) => setHp(String(v[0]))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-10 text-right">{hp}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Commitment level
                </label>
                <div className="flex items-center gap-3">
                  <Slider
                    min={1} max={5} step={1}
                    value={[Number(commitmentLevel)]}
                    onValueChange={(v) => setCommitmentLevel(String(v[0]))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-10 text-right">{commitmentLevel}/5</span>
                </div>
              </div>

              <FlawsPicker selectedFlaws={flaws} onFlawChange={(flaw, checked) =>
                setFlaws((prev) => checked ? [...prev, flaw] : prev.filter((f) => f !== flaw))
              } />

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Strengths</label>
                <div className="flex flex-wrap gap-2">
                  {STRENGTHS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setStrengths((prev) =>
                          prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                        )
                      }
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border capitalize transition-colors",
                        strengths.includes(s)
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <AttacksForm attacks={attacks} onAttackChange={handleAttackChange} />
            </div>
          )}
        </div>

        {saveError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {saveError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          className="w-full bg-foreground text-background rounded-full py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {isSaving ? "Adding..." : "Add to roster"}
        </button>
      </div>

      {/* Live card preview */}
      <div className="hidden lg:flex sticky top-24 flex-col items-center gap-3">
        <p className="text-xs text-muted-foreground">Live preview</p>
        <PersonCardDisplay
          cardData={cardData}
          selectedTheme={selectedTheme}
          selectedType={selectedType}
          image={image}
          imageScale={imageScale}
          imagePosition={imagePosition}
        />
      </div>

      <ImageAdjustmentDialog
        imageEditorRef={imageEditorRef}
        image={image}
        imageScale={imageScale}
        setImageScale={setImageScale}
        imagePosition={imagePosition}
        setImagePosition={setImagePosition}
        open={imageAdjustmentOpen}
        onOpenChange={setImageAdjustmentOpen}
        handleScaleChange={handleScaleChange}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={() => setIsDragging(false)}
      />
    </div>
  );
}
