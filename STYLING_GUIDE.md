# VSCode Styling Guide for React/TypeScript Applications

This guide provides comprehensive styling guidelines and VSCode extensions to help you efficiently style your React/TypeScript applications using Tailwind CSS.

## 🎨 Project Overview

You have two main projects:
- **lalo-chordgen**: Music chord generation tool with custom color palette
- **M4LProg**: Music production application with CSS-in-JS styling

Both projects use:
- React 19 + TypeScript
- Vite as build tool
- Tailwind CSS for styling
- Custom color palettes and design systems

## 🛠️ Essential VSCode Extensions

### Core Styling Extensions

#### 1. **Tailwind CSS IntelliSense**
- **Extension ID**: `bradlc.vscode-tailwindcss`
- **Purpose**: Autocompletion, syntax highlighting, and linting for Tailwind classes
- **Key Features**:
  - Real-time class suggestions
  - Hover previews of styles
  - Linting for unused classes
  - Custom class detection

#### 2. **Headwind**
- **Extension ID**: `heybourn.headwind`
- **Purpose**: Sorts and organizes Tailwind classes automatically
- **Key Features**:
  - Automatic class sorting on save
  - Custom sorting rules
  - Works with custom Tailwind configurations

#### 3. **CSS Modules**
- **Extension ID**: `clinyong.vscode-css-modules`
- **Purpose**: Enhanced CSS modules support with IntelliSense
- **Key Features**:
  - Class name completion
  - Go to definition support
  - Hover information

#### 4. **Color Highlight**
- **Extension ID**: `naumovs.color-highlight`
- **Purpose**: Visual color preview in CSS and JavaScript
- **Key Features**:
  - Color swatches in editor
  - Supports hex, rgb, hsl, and CSS variables
  - Customizable color formats

#### 5. **Bracket Pair Colorizer 2** (or built-in bracket highlighting)
- **Extension ID**: `CoenraadS.bracket-pair-colorizer-2`
- **Purpose**: Enhanced bracket matching for better code organization
- **Key Features**:
  - Color-coded brackets
  - Auto-closing brackets
  - Custom bracket colors

### Advanced Styling Tools

#### 6. **Polacode**
- **Extension ID**: `pnp.polacode`
- **Purpose**: Create beautiful code screenshots
- **Key Features**:
  - Code snippet screenshots
  - Custom themes
  - Export options

#### 7. **SVG Viewer**
- **Extension ID**: `cssho.vscode-svgviewer`
- **Purpose**: Preview SVG files directly in VSCode
- **Key Features**:
  - Side-by-side preview
  - Zoom and pan
  - SVG optimization hints

#### 8. **Live Server**
- **Extension ID**: `ritwickdey.liveserver`
- **Purpose**: Launch local development server with live reload
- **Key Features**:
  - Auto-refresh on file changes
  - Multiple browser support
  - Custom port configuration

## 🎯 Project-Specific Configuration

### lalo-chordgen Project

#### Tailwind Configuration
Your project uses a custom color palette with musical-themed colors:

```javascript
// tailwind.config.js
colors: {
  app: '#f7f9f3',
  panel: '#ffffff',
  muted: '#f0f0f0',
  'quality-maj': '#f59e0b',      // Major chords - Orange
  'quality-min': '#22d3ee',      // Minor chords - Turquoise
  'quality-dom': '#eab308',      // Dominant chords - Yellow
  'quality-dim': '#a855f7',      // Diminished chords - Purple
  'quality-aug': '#ec4899',      // Augmented chords - Pink
  'quality-sus': '#ef4444',      // Suspended chords - Red
  'quality-ext': '#22c55e',      // Extended chords - Green
  'quality-alt': '#3b82f6',      // Altered chords - Blue
}
```

#### Recommended VSCode Settings for lalo-chordgen

Create `.vscode/settings.json` in your lalo-chordgen directory:

```json
{
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["chordClass\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["qualityClass\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "headwind.sortTailwindClasses": true,
  "headwind.customClassRegex": [
    "chordClass\\(([^)]*)\\)",
    "qualityClass\\(([^)]*)\\)"
  ]
}
```

### M4LProg Project

#### CSS-in-JS Styling
Your M4LProg project uses CSS-in-JS with custom CSS variables and theme system:

```css
/* CSS Variables for Theme */
--color-background: var(--background);
--color-foreground: var(--foreground);
--color-primary: var(--primary);
--color-accent: var(--accent);
--color-destructive: var(--destructive);
```

#### Recommended VSCode Settings for M4LProg

Create `.vscode/settings.json` in your M4LProg directory:

```json
{
  "css.validate": true,
  "scss.validate": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "color-highlight.enable": true,
  "color-highlight.languages": [
    "css",
    "scss",
    "typescript",
    "typescriptreact"
  ],
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 🎨 Styling Best Practices

### 1. **Component Styling Patterns**

#### Tailwind CSS Components
```tsx
// Good: Use semantic class names
const Button = ({ variant = 'primary', children }) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
};
```

#### CSS Modules Pattern
```css
/* Button.module.css */
.button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.primary {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.secondary {
  background: var(--color-secondary);
  color: var(--color-secondary-foreground);
}
```

```tsx
// Button.tsx
import styles from './Button.module.css';

const Button = ({ variant = 'primary', children }) => {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
};
```

### 2. **Color Management**

#### Use CSS Variables for Theming
```css
:root {
  --color-primary: #4f46e5;
  --color-primary-foreground: #ffffff;
  --color-background: #ffffff;
  --color-foreground: #000000;
}

/* Dark theme override */
.dark {
  --color-primary: #818cf8;
  --color-primary-foreground: #000000;
  --color-background: #0f172a;
  --color-foreground: #f8fafc;
}
```

#### Tailwind Color Extensions
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        50: 'var(--color-primary-50)',
        100: 'var(--color-primary-100)',
        // ... more shades
      }
    }
  }
}
```

### 3. **Responsive Design**

#### Mobile-First Approach
```tsx
const ResponsiveComponent = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Mobile: stacked, Desktop: grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">Main content</div>
        <div className="md:col-span-1">Sidebar</div>
      </div>
    </div>
  );
};
```

### 4. **Animation and Transitions**

#### CSS-in-JS Animations
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

#### Tailwind Transitions
```tsx
const AnimatedButton = () => {
  return (
    <button className="
      px-4 py-2 rounded
      bg-blue-600 text-white
      hover:bg-blue-700
      transform hover:scale-105
      transition-all duration-200 ease-in-out
    ">
      Click me
    </button>
  );
};
```

## 🔧 VSCode Workflow Optimization

### 1. **Keyboard Shortcuts for Styling**

#### Essential Shortcuts
- `Ctrl+Space` - Trigger IntelliSense
- `Ctrl+Shift+P` - Open command palette
- `Alt+Shift+F` - Format document
- `Ctrl+K Ctrl+C` - Comment line
- `Ctrl+K Ctrl+U` - Uncomment line

#### Extension-Specific Shortcuts
- `Ctrl+Shift+P` → "Headwind: Sort Tailwind Classes"
- `Ctrl+Shift+P` → "Tailwind CSS: Restart Tailwind CSS Language Server"

### 2. **Snippets for Common Patterns**

Create `.vscode/snippets/typescript.json`:

```json
{
  "Tailwind Component": {
    "prefix": "tw-comp",
    "body": [
      "const ${1:ComponentName} = ({ children, className }) => {",
      "  return (",
      "    <div className={`${2:base-classes} ${className || ''}`}>",
      "      {children}",
      "    </div>",
      "  );",
      "};",
      "",
      "export default ${1:ComponentName};"
    ],
    "description": "Create a Tailwind component"
  },
  "CSS Module Component": {
    "prefix": "cssm-comp",
    "body": [
      "import styles from './${1:ComponentName}.module.css';",
      "",
      "const ${1:ComponentName} = ({ children, variant = 'primary' }) => {",
      "  return (",
      "    <div className={`${styles.${1:componentName}} ${styles[variant]}`}>",
      "      {children}",
      "    </div>",
      "  );",
      "};",
      "",
      "export default ${1:ComponentName};"
    ],
    "description": "Create a CSS Modules component"
  }
}
```

### 3. **File Organization**

#### Recommended Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   │   ├── index.tsx
│   │   │   ├── Button.module.css (if using CSS modules)
│   │   │   └── Button.test.tsx
│   │   └── Input/
│   ├── layout/
│   └── ui/
├── styles/
│   ├── globals.css
│   ├── theme.css
│   └── components/
└── hooks/
```

## 🎯 Project-Specific Tips

### For lalo-chordgen

1. **Leverage your custom color palette**:
   - Use semantic color names like `quality-maj`, `quality-min`
   - Create utility classes for chord types
   - Use consistent color naming across components

2. **Typography**:
   - Your project uses custom fonts (Atkinson Hyperlegible Next, Headland One)
   - Ensure font loading is optimized
   - Use appropriate font weights for hierarchy

### For M4LProg

1. **CSS-in-JS organization**:
   - Keep styles close to components
   - Use CSS variables for theming
   - Extract common styles to shared files

2. **Performance optimization**:
   - Use CSS-in-JS libraries that support style extraction
   - Minimize inline styles in render functions
   - Consider style composition patterns

## 🚀 Quick Setup Checklist

- [ ] Install all recommended VSCode extensions
- [ ] Configure project-specific `.vscode/settings.json` files
- [ ] Set up Tailwind IntelliSense for both projects
- [ ] Configure color highlighting
- [ ] Set up code formatting on save
- [ ] Create custom snippets for common patterns
- [ ] Organize component structure
- [ ] Establish naming conventions
- [ ] Set up theme management system
- [ ] Configure responsive design patterns

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [React Style Guidelines](https://react.dev/learn/style)
- [VSCode Extension Marketplace](https://marketplace.visualstudio.com/)

This guide should help you efficiently style your applications with the right tools and best practices!