# shadcn/ui Styling System Implementation Guide

This guide provides a complete setup for implementing shadcn/ui with strict styling conventions for your React/TypeScript projects.

## 🎯 Overview

shadcn/ui is a collection of beautifully designed, accessible, and customizable components built on top of Radix UI and Tailwind CSS. This guide will help you integrate it with your existing projects while maintaining strict styling standards.

## 🚀 Quick Setup

### 1. Install shadcn/ui Dependencies

```bash
# Core dependencies
npm install @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-toggle-group @radix-ui/react-toggle @radix-ui/react-tooltip @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle-group @radix-ui/react-accordion @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group

# shadcn/ui CLI
npm install -D shadcn-ui

# Additional utilities
npm install class-variance-authority clsx tailwind-merge
```

### 2. Initialize shadcn/ui

```bash
npx shadcn-ui@latest init
```

This will:
- Create a `components.json` configuration file
- Set up the components directory structure
- Configure your Tailwind setup

## 🎨 Strict Styling System

### 1. Enhanced Tailwind Configuration

Update your `tailwind.config.js` with strict styling rules:

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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Your existing color palette
        app: '#f7f9f3',
        panel: '#ffffff',
        muted: '#f0f0f0',
        'muted-text': '#333333',
        'quality-maj': '#f59e0b',
        'quality-min': '#22d3ee',
        'quality-dom': '#eab308',
        'quality-dim': '#a855f7',
        'quality-aug': '#ec4899',
        'quality-sus': '#ef4444',
        'quality-ext': '#22c55e',
        'quality-alt': '#3b82f6',
        
        // shadcn/ui semantic colors
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

### 2. CSS Variables Setup

Create `src/styles/globals.css` with strict CSS variables:

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

/* Strict component styling overrides */
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

## 🏗️ Component Architecture

### 1. Create Strict Component Variants

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

### 2. Create Strict Components

Create `src/components/ui/strict-button.tsx`:

```typescript
import * as React from "react";
import { strictButtonVariants, type StrictButtonProps } from "./strict-variants";

export function StrictButton({ className, variant, size, ...props }: StrictButtonProps) {
  return (
    <button
      className={strictButtonVariants({ variant, size, className })}
      {...props}
    />
  );
}

// Music-specific button variants
export function ChordButton({ quality, ...props }: { quality: string } & StrictButtonProps) {
  const qualityClasses = {
    maj: "bg-quality-maj text-white hover:bg-yellow-600",
    min: "bg-quality-min text-white hover:bg-turquoise-600",
    dom: "bg-quality-dom text-white hover:bg-yellow-600",
    dim: "bg-quality-dim text-white hover:bg-purple-600",
    aug: "bg-quality-aug text-white hover:bg-pink-600",
    sus: "bg-quality-sus text-white hover:bg-red-600",
    ext: "bg-quality-ext text-white hover:bg-green-600",
    alt: "bg-quality-alt text-white hover:bg-blue-600",
  };

  return (
    <StrictButton
      className={qualityClasses[quality as keyof typeof qualityClasses]}
      {...props}
    />
  );
}
```

Create `src/components/ui/strict-card.tsx`:

```typescript
import * as React from "react";
import { strictCardVariants, type StrictCardProps } from "./strict-variants";

export function StrictCard({ className, variant, padding, ...props }: StrictCardProps) {
  return (
    <div className={strictCardVariants({ variant, padding, className })} {...props} />
  );
}

export function StrictCardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function StrictCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function StrictCardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function StrictCardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function StrictCardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}
```

## 🎵 Music-Specific Components

### 1. Chord Display Component

Create `src/components/ui/chord-display.tsx`:

```typescript
import * as React from "react";
import { StrictCard } from "./strict-card";

interface ChordDisplayProps {
  chord: string;
  quality: string;
  notes: string[];
  className?: string;
}

export function ChordDisplay({ chord, quality, notes, className }: ChordDisplayProps) {
  const qualityColors = {
    maj: "bg-quality-maj",
    min: "bg-quality-min",
    dom: "bg-quality-dom",
    dim: "bg-quality-dim",
    aug: "bg-quality-aug",
    sus: "bg-quality-sus",
    ext: "bg-quality-ext",
    alt: "bg-quality-alt",
  };

  return (
    <StrictCard className={`border-2 ${qualityColors[quality]} ${className}`}>
      <StrictCardHeader>
        <StrictCardTitle className="text-4xl font-bold text-center">
          {chord}
        </StrictCardTitle>
        <StrictCardDescription className="text-center capitalize">
          {quality} chord
        </StrictCardDescription>
      </StrictCardHeader>
      <StrictCardContent>
        <div className="grid grid-cols-4 gap-2">
          {notes.map((note, index) => (
            <div
              key={index}
              className="bg-white/20 rounded-lg p-2 text-center font-mono text-sm"
            >
              {note}
            </div>
          ))}
        </div>
      </StrictCardContent>
    </StrictCard>
  );
}
```

### 2. Progression Editor Component

Create `src/components/ui/progression-editor.tsx`:

```typescript
import * as React from "react";
import { StrictCard } from "./strict-card";
import { StrictButton } from "./strict-button";

interface ProgressionEditorProps {
  progression: string[];
  onAddChord: (chord: string) => void;
  onRemoveChord: (index: number) => void;
  onMoveChord: (from: number, to: number) => void;
}

export function ProgressionEditor({ 
  progression, 
  onAddChord, 
  onRemoveChord, 
  onMoveChord 
}: ProgressionEditorProps) {
  return (
    <StrictCard>
      <StrictCardHeader>
        <StrictCardTitle>Chord Progression Editor</StrictCardTitle>
        <StrictCardDescription>
          Build and arrange your chord progressions
        </StrictCardDescription>
      </StrictCardHeader>
      <StrictCardContent>
        <div className="grid grid-cols-8 gap-2 mb-4">
          {progression.map((chord, index) => (
            <div
              key={index}
              className="bg-muted rounded-lg p-2 text-center relative"
            >
              <span className="text-sm font-mono">{chord}</span>
              <div className="absolute top-0 right-0 flex gap-1">
                <StrictButton
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemoveChord(index)}
                  className="h-6 w-6 text-xs"
                >
                  ×
                </StrictButton>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <StrictButton onClick={() => onAddChord("Cmaj")}>C Major</StrictButton>
          <StrictButton onClick={() => onAddChord("Am")}>A Minor</StrictButton>
          <StrictButton onClick={() => onAddChord("F")}>F Major</StrictButton>
          <StrictButton onClick={() => onAddChord("G")}>G Major</StrictButton>
        </div>
      </StrictCardContent>
    </StrictCard>
  );
}
```

## 🔧 Strict Styling Guidelines

### 1. Component Naming Convention

```typescript
// ✅ Good: Semantic and descriptive
StrictButton
StrictCard
ChordDisplay
ProgressionEditor

// ❌ Bad: Generic or unclear
Button
Card
Display
Editor
```

### 2. CSS-in-JS Strict Rules

```typescript
// ✅ Good: Use shadcn/ui patterns
const component = styled('div')({
  // Use CSS variables
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)',
  // Use utility classes when possible
  '@apply rounded-lg border': true,
});

// ❌ Bad: Hardcoded values
const component = styled('div')({
  backgroundColor: '#ffffff',
  color: '#000000',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
});
```

### 3. Responsive Design Strict Rules

```typescript
// ✅ Good: Mobile-first approach
const responsiveComponent = styled('div')({
  // Base styles (mobile)
  padding: '1rem',
  
  // Tablet
  '@media (min-width: 768px)': {
    padding: '1.5rem',
  },
  
  // Desktop
  '@media (min-width: 1024px)': {
    padding: '2rem',
  },
});

// ❌ Bad: Desktop-first or inconsistent breakpoints
const responsiveComponent = styled('div')({
  '@media (max-width: 1024px)': {
    padding: '1rem',
  },
  '@media (max-width: 768px)': {
    padding: '0.5rem',
  },
});
```

## 🎨 Theme System Integration

### 1. Create Theme Provider

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

### 2. Update App Root

Update your main App component:

```typescript
import { ThemeProvider } from "@/components/ThemeProvider";
import { StrictCard } from "@/components/ui/strict-card";

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        <StrictCard>
          {/* Your app content */}
        </StrictCard>
      </div>
    </ThemeProvider>
  );
}
```

## 📦 Installation Commands

### For lalo-chordgen:

```bash
cd lalo-chordgen
npm install @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-toggle-group @radix-ui/react-toggle @radix-ui/react-tooltip @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast class-variance-authority clsx tailwind-merge
npm install -D shadcn-ui
npx shadcn-ui@latest init
```

### For M4LProg:

```bash
cd M4LProg
npm install @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-toggle-group @radix-ui/react-toggle @radix-ui/react-tooltip @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast class-variance-authority clsx tailwind-merge
npm install -D shadcn-ui
npx shadcn-ui@latest init
```

## 🎯 Next Steps

1. **Install Dependencies**: Run the installation commands above
2. **Initialize shadcn/ui**: Run `npx shadcn-ui@latest init`
3. **Add Components**: Use `npx shadcn-ui@latest add [component]` to add specific components
4. **Implement Strict Variants**: Use the provided strict component variants
5. **Theme Integration**: Set up the theme provider
6. **Custom Components**: Build your music-specific components using the strict patterns

This system provides a solid foundation for building beautiful, accessible, and maintainable UI components with strict styling conventions that integrate seamlessly with your existing projects.