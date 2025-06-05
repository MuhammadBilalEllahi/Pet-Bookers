import { dark as darkTheme, light as lightTheme } from '@eva-design/eva';

const extendTheme = {
  // Primary colors (Orange)
  "color-primary-100": "#FFF2E6",
  "color-primary-200": "#FFD6B3",
  "color-primary-300": "#FFB380",
  "color-primary-400": "#FF904D",
  "color-primary-500": "#FF6D1A",
  "color-primary-600": "#E65C00",
  "color-primary-700": "#B34700",
  "color-primary-800": "#803300",
  "color-primary-900": "#4D1F00",

  // Basic colors (Shadcn inspired)
  "color-basic-100": "#FFFFFF",
  "color-basic-200": "#F7F9FC",
  "color-basic-300": "#EDF1F7",
  "color-basic-400": "#E4E9F2",
  "color-basic-500": "#C5CEE0",
  "color-basic-600": "#8F9BB3",
  "color-basic-700": "#2E3A59",
  "color-basic-800": "#222B45",
  "color-basic-900": "#1A2138",
  "color-basic-1000": "#151A30",
  "color-basic-1100": "#121212",

  // Shadcn specific colors
  "color-shadcn-background": "#121212",
  "color-shadcn-foreground": "#FFFFFF",
  "color-shadcn-card": "#1E1E1E",
  "color-shadcn-card-foreground": "#FFFFFF",
  "color-shadcn-popover": "#1E1E1E",
  "color-shadcn-popover-foreground": "#FFFFFF",
  "color-shadcn-primary": "#FF6D1A",
  "color-shadcn-primary-foreground": "#FFFFFF",
  "color-shadcn-secondary": "#2D2D2D",
  "color-shadcn-secondary-foreground": "#FFFFFF",
  "color-shadcn-muted": "#2D2D2D",
  "color-shadcn-muted-foreground": "#8F9BB3",
  "color-shadcn-accent": "#3D3D3D",
  "color-shadcn-accent-foreground": "#FFFFFF",
  "color-shadcn-destructive": "#FF4D4F",
  "color-shadcn-destructive-foreground": "#FFFFFF",
  "color-shadcn-border": "#2D2D2D",
  "color-shadcn-input": "#2D2D2D",
  "color-shadcn-ring": "#FF6D1A",
};

export const light = {
  ...lightTheme,
  ...extendTheme,
  "background-basic-color-1": "$color-basic-100",
  "background-basic-color-2": "$color-basic-200",
  "background-basic-color-3": "$color-basic-300",
  "background-basic-color-4": "$color-basic-400",
  "text-basic-color": "$color-basic-900",
  "text-alternate-color": "$color-basic-100",
};

export const dark = {
  ...darkTheme,
  ...extendTheme,
  // Main background colors
  "background-basic-color-1": "$color-shadcn-background",
  "background-basic-color-2": "$color-shadcn-card",
  "background-basic-color-3": "$color-shadcn-secondary",
  "background-basic-color-4": "$color-shadcn-accent",
  
  // Text colors
  "text-basic-color": "$color-shadcn-foreground",
  "text-alternate-color": "$color-shadcn-muted-foreground",
  
  // UI Element colors
  "color-primary-default": "$color-shadcn-primary",
  "color-primary-active": "$color-shadcn-primary-600",
  "color-primary-focus": "$color-shadcn-primary-700",
  "color-primary-disabled": "$color-shadcn-muted",
  
  // Border and input colors
  "border-basic-color-1": "$color-shadcn-border",
  "border-basic-color-2": "$color-shadcn-border",
  "border-basic-color-3": "$color-shadcn-border",
  "border-basic-color-4": "$color-shadcn-border",
  
  // Input colors
  "input-basic-background-color": "$color-shadcn-input",
  "input-basic-text-color": "$color-shadcn-foreground",
  "input-basic-border-color": "$color-shadcn-border",
  
  // Card colors
  "card-background-color": "$color-shadcn-card",
  "card-text-color": "$color-shadcn-card-foreground",
  
  // Popover colors
  "popover-background-color": "$color-shadcn-popover",
  "popover-text-color": "$color-shadcn-popover-foreground",
}; 