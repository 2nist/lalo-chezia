import * as React from "react";
import { StrictCard } from "./strict-card";
import { StrictButton } from "./strict-button";
import { ChordButton } from "./chord-button";
import { ProgressionGrid } from "./progression-grid";
import { ThemeProvider } from "./theme-provider";

export function Demo() {
  const [progression, setProgression] = React.useState([
    { chord: "C", quality: "maj" },
    { chord: "G", quality: "maj" },
    { chord: "Am", quality: "min" },
    { chord: "F", quality: "maj" },
  ]);

  const handleAddChord = (chord: string, quality: string) => {
    setProgression([...progression, { chord, quality }]);
  };

  const handleRemoveChord = (index: number) => {
    setProgression(progression.filter((_, i) => i !== index));
  };

  return (
    <ThemeProvider>
      <div className="container p-6 mx-auto space-y-6">
        <StrictCard>
          <div className="p-6">
            <h1 className="mb-4 text-3xl font-bold">Shadcn/UI Integration Demo</h1>
            <p className="text-muted-foreground">
              This demonstrates the new shadcn/ui component system with strict styling rules.
            </p>
          </div>
        </StrictCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StrictCard>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Custom Chord Buttons</h2>
              <div className="grid grid-cols-4 gap-2">
                <ChordButton quality="maj" chord="C" onClick={() => handleAddChord("C", "maj")} />
                <ChordButton quality="min" chord="Am" onClick={() => handleAddChord("Am", "min")} />
                <ChordButton quality="maj" chord="F" onClick={() => handleAddChord("F", "maj")} />
                <ChordButton quality="maj" chord="G" onClick={() => handleAddChord("G", "maj")} />
              </div>
            </div>
          </StrictCard>

          <ProgressionGrid
            progression={progression}
            onAddChord={handleAddChord}
            onRemoveChord={handleRemoveChord}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StrictCard>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Button Variants</h2>
              <div className="space-y-2">
                <StrictButton variant="default">Default</StrictButton>
                <StrictButton variant="destructive">Destructive</StrictButton>
                <StrictButton variant="outline">Outline</StrictButton>
                <StrictButton variant="secondary">Secondary</StrictButton>
                <StrictButton variant="ghost">Ghost</StrictButton>
                <StrictButton variant="link">Link</StrictButton>
              </div>
            </div>
          </StrictCard>

          <StrictCard>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Button Sizes</h2>
              <div className="space-y-2">
                <StrictButton size="sm">Small</StrictButton>
                <StrictButton size="default">Default</StrictButton>
                <StrictButton size="lg">Large</StrictButton>
                <StrictButton size="icon">Icon</StrictButton>
              </div>
            </div>
          </StrictCard>

          <StrictCard>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Card Variants</h2>
              <div className="space-y-4">
                <StrictCard variant="default" padding="default">
                  <div className="p-6">
                    <h3 className="font-semibold">Default Card</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Standard card with default padding
                    </p>
                  </div>
                </StrictCard>
                
                <StrictCard variant="elevated" padding="sm">
                  <div className="p-4">
                    <h3 className="font-semibold">Elevated Card</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Card with enhanced shadow
                    </p>
                  </div>
                </StrictCard>
              </div>
            </div>
          </StrictCard>
        </div>
      </div>
    </ThemeProvider>
  );
}