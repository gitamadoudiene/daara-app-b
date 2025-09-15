import * as React from "react";
import { Badge } from "./badge";

const DEFAULT_MATIERES = [
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

export function MatiereTagsInput({ value, onChange, matieres }: {
  value: string[];
  onChange: (selected: string[]) => void;
  matieres?: string[];
}) {
  const [input, setInput] = React.useState("");
  const availableMatieres = matieres || DEFAULT_MATIERES;
  const filtered = availableMatieres.filter(m => m.toLowerCase().includes(input.toLowerCase()) && !value.includes(m));

  function addTag(tag: string) {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
      setInput("");
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <Badge key={tag} variant="secondary">
            {tag}
            <button
              type="button"
              className="ml-1 text-xs text-red-500"
              onClick={() => onChange(value.filter(t => t !== tag))}
            >×</button>
          </Badge>
        ))}
      </div>
      <input
        className="w-full border rounded px-2 py-1 mb-2"
        type="text"
        placeholder="Ajouter une matière..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && input.trim()) {
            addTag(input.trim());
          }
        }}
      />
      {input.length > 0 && filtered.length > 0 && (
        <div className="border rounded bg-white shadow p-2 mt-1">
          {filtered.map(tag => (
            <div
              key={tag}
              className="cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
              onClick={() => addTag(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
