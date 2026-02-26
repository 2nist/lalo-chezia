import * as React from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { ThemeProvider } from "./theme-provider";

export function ShadcnDemo() {
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
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Shadcn/UI Components Demo</CardTitle>
            <CardDescription>
              This demonstrates the actual shadcn/ui component system with your custom styling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Button Examples */}
              <Card>
                <CardHeader>
                  <CardTitle>Button Components</CardTitle>
                  <CardDescription>Various button variants and sizes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Form Components */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Components</CardTitle>
                  <CardDescription>Input, Select, and Dropdown examples</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Enter chord progression name" />
                  
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select key" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C">C Major</SelectItem>
                      <SelectItem value="G">G Major</SelectItem>
                      <SelectItem value="Am">A Minor</SelectItem>
                      <SelectItem value="F">F Major</SelectItem>
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Chord Quality</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Maj</DropdownMenuItem>
                      <DropdownMenuItem>Min</DropdownMenuItem>
                      <DropdownMenuItem>Dom</DropdownMenuItem>
                      <DropdownMenuItem>Dim</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>

            {/* Dialog Example */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Dialog Example</CardTitle>
                <CardDescription>Modal dialog with form</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open Progression Settings</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Progression Settings</DialogTitle>
                      <DialogDescription>
                        Configure your chord progression settings here.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid items-center grid-cols-4 gap-4">
                        <label htmlFor="name" className="text-right">
                          Name
                        </label>
                        <Input id="name" placeholder="My Progression" className="col-span-3" />
                      </div>
                      <div className="grid items-center grid-cols-4 gap-4">
                        <label htmlFor="tempo" className="text-right">
                          Tempo
                        </label>
                        <Input id="tempo" type="number" placeholder="120" className="col-span-3" />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Accordion Example */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Accordion Example</CardTitle>
                <CardDescription>Expandable sections with chord information</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Chord Theory Basics</AccordionTrigger>
                    <AccordionContent>
                      Learn about chord construction, inversions, and voicings. 
                      Understanding chord theory will help you create more interesting progressions.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Progression Patterns</AccordionTrigger>
                    <AccordionContent>
                      Explore common chord progression patterns like I-V-vi-IV, 
                      ii-V-I, and modal interchange progressions.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Advanced Techniques</AccordionTrigger>
                    <AccordionContent>
                      Discover advanced techniques like secondary dominants, 
                      tritone substitutions, and modal mixture.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Progression Grid with shadcn/ui */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Progression Grid</CardTitle>
                <CardDescription>Interactive chord progression builder</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-2 mb-4">
                  {progression.map((item, index) => (
                    <Card key={index} className="p-3 text-center rounded-lg bg-muted">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleRemoveChord(index)}
                      >
                        {item.chord} {item.quality}
                      </Button>
                    </Card>
                  ))}
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" onClick={() => handleAddChord("C", "maj")}>
                    C Maj
                  </Button>
                  <Button variant="outline" onClick={() => handleAddChord("Am", "min")}>
                    Am Min
                  </Button>
                  <Button variant="outline" onClick={() => handleAddChord("F", "maj")}>
                    F Maj
                  </Button>
                  <Button variant="outline" onClick={() => handleAddChord("G", "maj")}>
                    G Maj
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
}