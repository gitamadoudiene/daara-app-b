import * as React from "react";
import { Command, CommandInput, CommandItem, CommandList } from "./command";
import { Badge } from "./badge";

const MATIERES = [
  "Mathématiques",
  "Physique",
  "Chimie",
  "SVT",
  "Français",
  "Anglais",
  "Histoire-Géographie",
  "Philosophie",
  "Informatique",
  "Autre"
];

export function MultiSelectMatiere({ value, onChange }: {
  value: string[];
  onChange: (selected: string[]) => void;
}) {
  const [search, setSearch] = React.useState("");
  const filtered = MATIERES.filter(m => m.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Command>
        <CommandInput placeholder="Rechercher une matière..." value={search} onValueChange={setSearch} />
        <CommandList>
          {filtered.map(matiere => (
            <CommandItem
              key={matiere}
              onSelect={() => {
                if (!value.includes(matiere)) onChange([...value, matiere]);
              }}
            >
              <span>{matiere}</span>
              {value.includes(matiere) && <Badge className="ml-2">Sélectionné</Badge>}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map(matiere => (
          <Badge key={matiere} variant="secondary">
            {matiere}
            <button
              type="button"
              className="ml-1 text-xs text-red-500"
              onClick={() => onChange(value.filter(m => m !== matiere))}
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
