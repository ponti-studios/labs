"use client";

import type React from "react";

import { Camera, X, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@pontistudios/ui";
import { Card, CardHeader } from "@pontistudios/ui";
import { Input } from "@pontistudios/ui";
import { Label } from "@pontistudios/ui";
import { Slider } from "@pontistudios/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pontistudios/ui";
import { AddRatingDialog } from "~/components/voter/add-rating-dialog";
import { AttacksForm } from "~/components/voter/attacks-form";
import { COLOR_THEMES, CardThemePicker } from "~/components/voter/card-theme-picker";
import { FlawsPicker } from "~/components/voter/flaws-picker";
import { ImageAdjustmentDialog } from "~/components/voter/image-adjustment-dialog";
import { PersonCardDisplay } from "~/components/voter/person-card-display";
import { ShareDialog } from "~/components/voter/share-dialog";
import { useAuth } from "../../components/AuthProvider";
import {
  PERSONALITY_TYPES,
  PersonalityTypePicker,
} from "../../components/voter/personality-type-picker";

// Mock data for friend ratings
type Rating = {
  id: string;
  name: string;
  verdict: "stay" | "dump";
  comment: string;
  date: Date;
};

export function CardCreator() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null); // New state for the selected file
  const [cardData, setCardData] = useState({
    name: "Alex",
    hp: "85",
    cardType: "caring",
    description: "A thoughtful partner who always remembers the little things that matter.",
    attacks: [
      { name: "Morning Coffee", damage: 30 },
      { name: "Surprise Gifts", damage: 50 },
    ],
    flaws: ["stubborn", "forgetful"],
    strengths: ["patient", "supportive"],
    commitmentLevel: "2",
  });

  const [colorTheme, setColorTheme] = useState("classic");
  const [image, setImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageAdjustmentDialogOpen, setImageAdjustmentDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // New rating form state
  const [newRating, setNewRating] = useState({
    name: "",
    verdict: "" as "stay" | "dump" | "",
    comment: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const imageEditorRef = useRef<HTMLDivElement | null>(null);
  const [formHeight, setFormHeight] = useState(0);

  // Track the form card height
  useEffect(() => {
    const updateHeight = () => {
      if (formCardRef.current) {
        setFormHeight(formCardRef.current.offsetHeight);
      }
    };

    // Initial height
    updateHeight();

    // Update height on window resize
    window.addEventListener("resize", updateHeight);

    // Update height when tab content changes
    const observer = new MutationObserver(updateHeight);
    if (formCardRef.current) {
      observer.observe(formCardRef.current, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      observer.disconnect();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonalityTypeChange = (value: string) => {
    setCardData((prev) => ({ ...prev, cardType: value }));
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setCardData((prev) => ({ ...prev, [name]: String(value[0]) }));
  };

  const handleAttackChange = (index: number, field: "name" | "damage", value: string) => {
    setCardData((prev) => {
      const newAttacks = prev.attacks.map((attack, i) => {
        if (i === index) {
          return { ...attack, [field]: value };
        }
        return attack;
      });
      return { ...prev, attacks: newAttacks };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file); // Store the file object

      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string); // Set local preview (base64)
        setImageScale(1);
        setImagePosition({ x: 0, y: 0 });
        setImageAdjustmentDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = async () => {
    setImage(null);
    setSelectedImageFile(null); // Clear the selected file
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Local file cleanup - no Supabase storage to manage
  };

  const downloadCard = () => {
    // In a real implementation, this would capture the card as an image and download it
    alert("In a real implementation, this would download your card as an image!");
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageEditorRef.current) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageEditorRef.current) return;

    const bounds = imageEditorRef.current.getBoundingClientRect();
    const maxX = ((imageScale - 1) * bounds.width) / 2;
    const maxY = ((imageScale - 1) * bounds.height) / 2;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Constrain movement based on scale
    const constrainedX = Math.max(-maxX, Math.min(maxX, newX));
    const constrainedY = Math.max(-maxY, Math.min(maxY, newY));

    setImagePosition({
      x: constrainedX,
      y: constrainedY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (value: number[]) => {
    const newScale = value[0];
    setImageScale(newScale);

    // Adjust position if needed to stay within bounds
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

  const handleNewRatingChange = (field: string, value: string) => {
    setNewRating((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitRating = () => {
    if (!newRating.name || !newRating.verdict) return;

    const newRatingObj: Rating = {
      id: Date.now().toString(),
      name: newRating.name,
      verdict: newRating.verdict,
      comment: newRating.comment,
      date: new Date(),
    };

    setNewRating({
      name: "",
      verdict: "",
      comment: "",
    });
    setRatingDialogOpen(false);
  };

  const handleFlawChange = (flaw: string, checked: boolean) => {
    setCardData((prev) => {
      const newFlaws = checked ? [...prev.flaws, flaw] : prev.flaws.filter((f) => f !== flaw);
      return { ...prev, flaws: newFlaws };
    });
  };

  const copyShareLink = () => {
    // In a real implementation, this would generate and copy a unique link
    navigator.clipboard.writeText("https://partner-cards.example.com/share/alex-123456");
    alert("Share link copied to clipboard!");
  };

  const handleSaveTracker = async () => {
    if (!user) {
      alert("You must be logged in to create a tracker.");
      return;
    }

    setIsSaving(true);
    let finalPhotoUrl = image;

    // If a new image file was selected, upload it now
    if (selectedImageFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedImageFile);
        formData.append("userId", user.id);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const data = await response.json();
        finalPhotoUrl = data.url;
        setImage(finalPhotoUrl);
        setSelectedImageFile(null);
      } catch (error: any) {
        console.error("Error uploading image:", error);
        alert(`Error uploading image: ${error.message}`);
        setIsSaving(false);
        return;
      }
    } else if (!image && fileInputRef.current?.value) {
      finalPhotoUrl = null;
    }

    const attacksForDb = cardData.attacks
      .filter((attack) => attack.name && attack.damage)
      .map((attack) => ({
        name: attack.name,
        damage: Number(attack.damage),
      }));

    const trackerToSave = {
      name: cardData.name,
      hp: cardData.hp,
      cardType: cardData.cardType,
      description: cardData.description,
      attacks: attacksForDb,
      strengths: cardData.strengths,
      flaws: cardData.flaws,
      commitmentLevel: cardData.commitmentLevel,
      colorTheme: colorTheme,
      photoUrl: finalPhotoUrl,
      imageScale: imageScale,
      imagePosition: imagePosition,
      userId: user.id,
    };

    try {
      const response = await fetch("/api/trackers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trackerToSave),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save tracker");
      }

      const data = await response.json();
      alert("Tracker created successfully!");
      console.log("Tracker saved:", data);
    } catch (err: any) {
      console.error("Error saving tracker:", err);
      alert(`Error saving tracker: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTheme = COLOR_THEMES.find((theme) => theme.value === colorTheme) || COLOR_THEMES[0];
  const selectedType =
    PERSONALITY_TYPES.find((type) => type.value === cardData.cardType) || PERSONALITY_TYPES[0];

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="order-2 lg:order-1">
        <Card ref={formCardRef} className="border-gray-200 shadow-sm">
          <CardHeader className="pb-0">
            <Tabs
              defaultValue="details"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-4 bg-gray-100">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  Personality
                </TabsTrigger>
                <TabsTrigger
                  value="attacks"
                  className="data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  Qualities
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Partner Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={cardData.name}
                      onChange={handleInputChange}
                      placeholder="Name"
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hp" className="text-gray-700">
                      Relationship Health
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="hp"
                        min={10}
                        max={300}
                        step={10}
                        value={[Number(cardData.hp)]}
                        onValueChange={(value) => handleSliderChange("hp", value)}
                        className="flex-1"
                      />
                      <span className="w-12 text-center font-bold">{cardData.hp}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">
                    Description
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={cardData.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>

                <PersonalityTypePicker
                  value={cardData.cardType}
                  onChange={handlePersonalityTypeChange}
                />

                <div className="space-y-2">
                  <Label className="text-gray-700">Partner Photo</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    {image ? (
                      <div className="relative w-full max-w-[200px] aspect-[4/5]">
                        <div className="absolute inset-0 overflow-hidden rounded-lg">
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              overflow: "hidden",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                transform: `scale(${imageScale}) translate(${imagePosition.x / imageScale}px, ${
                                  imagePosition.y / imageScale
                                }px)`,
                                backgroundImage: `url(${image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            />
                          </div>
                        </div>
                        <div className="absolute -top-2 -right-2 flex gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 bg-white hover:bg-gray-100"
                            onClick={() => setImageAdjustmentDialogOpen(true)}
                          >
                            <ZoomIn className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-6 w-6 bg-gray-800 hover:bg-black"
                            onClick={removeImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Camera className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Upload your partner's photo</p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-black hover:bg-gray-800 text-white"
                        >
                          Choose Image
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4">
                <CardThemePicker colorTheme={colorTheme} setColorTheme={setColorTheme} />

                <div className="grid grid-cols-1 gap-4">
                  <FlawsPicker selectedFlaws={cardData.flaws} onFlawChange={handleFlawChange} />

                  <div className="space-y-2">
                    <Label className="text-gray-700">Strengths (Select Multiple)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border border-gray-300 rounded-md bg-white">
                      {[
                        "patient",
                        "supportive",
                        "honest",
                        "generous",
                        "communicative",
                        "trustworthy",
                        "affectionate",
                        "respectful",
                        "understanding",
                        "reliable",
                      ].map((strength) => (
                        <div key={strength} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`strength-${strength}`}
                            checked={cardData.strengths.includes(strength)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCardData((prev) => ({
                                  ...prev,
                                  strengths: [...prev.strengths, strength],
                                }));
                              } else {
                                setCardData((prev) => ({
                                  ...prev,
                                  strengths: prev.strengths.filter((r) => r !== strength),
                                }));
                              }
                            }}
                            className="rounded border-gray-400 text-black focus:ring-gray-500"
                          />
                          <Label
                            htmlFor={`strength-${strength}`}
                            className="text-sm capitalize text-gray-700"
                          >
                            {strength}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commitmentLevel" className="text-gray-700">
                    Commitment Level (1-5)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="commitmentLevel"
                      min={1}
                      max={5}
                      step={1}
                      value={[Number(cardData.commitmentLevel)]}
                      onValueChange={(value) => handleSliderChange("commitmentLevel", value)}
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-bold">{cardData.commitmentLevel}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attacks">
                <AttacksForm attacks={cardData.attacks} onAttackChange={handleAttackChange} />
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSaveTracker}
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isSaving ? "Creating..." : "Create Tracker"}
          </Button>
        </div>
      </div>

      <div className="order-1 lg:order-2 flex justify-center">
        <div
          className="sticky top-8 flex items-center justify-center"
          style={{ minHeight: formHeight > 0 ? `${formHeight}px` : "auto" }}
        >
          <PersonCardDisplay
            cardData={cardData}
            selectedTheme={selectedTheme}
            selectedType={selectedType}
            image={image}
            imageScale={imageScale}
            imagePosition={imagePosition}
          />
        </div>
      </div>

      {/* Dialogs */}
      <ImageAdjustmentDialog
        imageEditorRef={imageEditorRef}
        image={image}
        imageScale={imageScale}
        setImageScale={setImageScale}
        imagePosition={imagePosition}
        setImagePosition={setImagePosition}
        open={imageAdjustmentDialogOpen}
        onOpenChange={setImageAdjustmentDialogOpen}
        handleScaleChange={handleScaleChange}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
      />

      <AddRatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        newRating={newRating}
        handleNewRatingChange={handleNewRatingChange}
        submitRating={submitRating}
      />

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        copyShareLink={copyShareLink}
        cardName={cardData.name}
      />
    </div>
  );
}

export default CardCreator;
