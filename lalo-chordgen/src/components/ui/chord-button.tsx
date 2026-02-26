import * as React from "react";
import { StrictButton } from "./strict-button";
import { StrictButtonProps } from "./strict-variants";

interface ChordButtonProps extends StrictButtonProps {
  quality: string;
  chord: string;
}

export function ChordButton({ quality, chord, className, ...props }: ChordButtonProps) {
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
      className={`${qualityClasses[quality as keyof typeof qualityClasses]} ${className || ''}`}
      {...props}
    >
      {chord}
    </StrictButton>
  );
}
