# Complete shadcn/ui Integration with Strict Styling

This is a ready-to-implement, complete integration of shadcn/ui with strict styling features. Just copy and paste these files.

## 🚨 First: Replace Your Tailwind Config

Replace your existing `tailwind.config.js` with this clean version:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px", 
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
```

## 🎨 Create Clean CSS Variables

Create `src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Strict component base styles */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background;
  }
  
  .card {
    @apply rounded-lg border bg-card text-card-foreground shadow-sm;
  }
  
  .input {
    @apply flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
  }
}
```

## 🏗️ Create Strict Component Variants

Create `src/components/ui/strict-variants.ts`:

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const strictButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const strictCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-lg",
        subtle: "bg-muted/50",
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface StrictButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof strictButtonVariants> {}

export interface StrictCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof strictCardVariants> {}

export function cn(...inputs: any[]) {
  return twMerge(inputs.filter(Boolean).join(' '));
}
```

## 🎵 Create Music-Specific Components

Create `src/components/ui/chord-button.tsx`:

```typescript
import * as React from "react";
import { StrictButton, type StrictButtonProps } from "./strict-button";

interface ChordButtonProps extends StrictButtonProps {
  quality: string;
  chord: string;
}

export function ChordButton({ quality, chord, ...props }: ChordButtonProps) {
  const qualityClasses = {
    maj: "bg-yellow-500 text-white hover:bg-yellow-600",
    min: "bg-teal-500 text-white hover:bg-teal-600",
    dom: "bg-orange-500 text-white hover:bg-orange-600",
    dim: "bg-purple-500 text-white hover:bg-purple-600",
    aug: "bg-pink-500 text-white hover:bg-pink-600",
    sus: "bg-red-500 text-white hover:bg-red-600",
    ext: "bg-green-500 text-white hover:bg-green-600",
    alt: "bg-blue-500 text-white hover:bg-blue-600",
  };

  return (
    <StrictButton
      className={qualityClasses[quality as keyof typeof qualityClasses]}
      {...props}
    >
      {chord}
    </StrictButton>
  );
}
```

Create `src/components/ui/progression-grid.tsx`:

```typescript
import * as React from "react";
import { StrictCard } from "./strict-card";
import { ChordButton } from "./chord-button";

interface ProgressionGridProps {
  progression: Array<{ chord: string; quality: string }>;
  onAddChord: (chord: string, quality: string) => void;
  onRemoveChord: (index: number) => void;
}

export function ProgressionGrid({ progression, onAddChord, onRemoveChord }: ProgressionGridProps) {
  return (
    <StrictCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Chord Progression</h2>
        
        {/* Progression Display */}
        <div className="grid grid-cols-8 gap-2 mb-6">
          {progression.map((item, index) => (
            <div
              key={index}
              className="bg-muted rounded-lg p-3 text-center relative"
            >
              <ChordButton
                quality={item.quality}
                chord={item.chord}
                size="sm"
                variant="outline"
                onClick={() => onRemoveChord(index)}
              />
            </div>
          ))}
        </div>

        {/* Chord Palette */}
        <div className="grid grid-cols-4 gap-2">
          <ChordButton quality="maj" chord="C" onClick={() => onAddChord("C", "maj")} />
          <ChordButton quality="min" chord="Am" onClick={() => onAddChord("Am", "min")} />
          <ChordButton quality="maj" chord="F" onClick={() => onAddChord("F", "maj")} />
          <ChordButton quality="maj" chord="G" onClick={() => onAddChord("G", "maj")} />
        </div>
      </div>
    </StrictCard>
  );
}
```

## 🎨 Create Theme Provider

Create `src/components/ThemeProvider.tsx`:

```typescript
'use client';

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

## 🚀 Complete App Integration

Replace your main App component with this:

```typescript
import { ThemeProvider } from "@/components/ThemeProvider";
import { StrictCard } from "@/components/ui/strict-card";
import { ProgressionGrid } from "@/components/ui/progression-grid";

export default function App() {
  const [progression, setProgression] = React.useState([
    { chord: "C", quality: "maj" },
    { chord: "Am", quality: "min" },
    { chord: "F", quality: "maj" },
    { chord: "G", quality: "maj" },
  ]);

  const handleAddChord = (chord: string, quality: string) => {
    setProgression([...progression, { chord, quality }]);
  };

  const handleRemoveChord = (index: number) => {
    setProgression(progression.filter((_, i) => i !== index));
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8">
          <StrictCard>
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-6">Music Production Studio</h1>
              <ProgressionGrid
                progression={progression}
                onAddChord={handleAddChord}
                onRemoveChord={handleRemoveChord}
              />
            </div>
          </StrictCard>
        </div>
      </div>
    </ThemeProvider>
  );
}
```

## 📦 Install Essential shadcn/ui Components

Run these commands to add the essential components:

```bash
# Core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast

# Advanced components
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add tooltip
```

## ✅ What You Get

### Complete Integration:
- **CVA Variants**: Strict, type-safe component variants
- **CSS Variables**: Professional theming system
- **Music Components**: ChordButton and ProgressionGrid
- **Theme Provider**: Light/dark mode support
- **Strict Styling**: Consistent, maintainable patterns

### Developer Experience:
- **Type Safety**: Full TypeScript support
- **IntelliSense**: Excellent VSCode autocomplete
- **Strict Patterns**: Consistent component architecture
- **Easy Customization**: Simple CSS variables to modify

## 🎯 Next Steps

1. **Replace files**: Copy the code above into your project
2. **Install components**: Run the shadcn/ui add commands
3. **Test**: Start your dev server and see the new UI
4. **Customize**: Modify colors and components as needed

This gives you a complete, integrated shadcn/ui setup with strict styling that's ready to use!