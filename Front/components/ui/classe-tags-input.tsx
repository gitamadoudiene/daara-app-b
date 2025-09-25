import * as React from "react";
import { Badge } from "./badge";

export function ClasseTagsInput({ 
  options = [], 
  value = [], 
  onChange, 
  error,
  onRetry
}: {
  options: string[];
  value: string[];
  onChange: (selected: string[]) => void;
  error?: string;
  onRetry?: () => void;
}) {
  const [input, setInput] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(error || null);
  
  // S'assurer que options et value sont des tableaux
  const safeOptions = Array.isArray(options) ? options : [];
  const safeValue = Array.isArray(value) ? value : [];
  
  // Mettre à jour l'erreur si elle change via les props
  React.useEffect(() => {
    if (error !== undefined) {
      setErrorMessage(error);
    }
  }, [error]);

  // Filtre plus robuste avec vérification des valeurs nulles
  const filtered = safeOptions.filter(c => 
    c && // S'assurer que c n'est pas null ou undefined
    typeof c === 'string' && 
    c.toLowerCase().includes((input || '').toLowerCase()) && 
    !safeValue.includes(c)
  );

  function addTag(tag: string) {
    if (tag && !safeValue.includes(tag)) {
      onChange([...safeValue, tag]);
      setInput("");
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {safeValue.map((tag, index) => (
          <Badge key={tag || `tag-${index}`} variant="secondary">
            {tag || `Classe ${index + 1}`}
            <button
              type="button"
              className="ml-1 text-xs text-red-500"
              onClick={() => onChange(safeValue.filter(t => t !== tag))}
            >×</button>
          </Badge>
        ))}
      </div>
      <input
        className="w-full border rounded px-2 py-1 mb-2"
        type="text"
        placeholder="Ajouter une classe..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && input.trim()) {
            addTag(input.trim());
          }
        }}
      />
      
      {/* Afficher le nombre de classes disponibles */}
      {safeOptions.length > 0 && (
        <div className="text-xs text-gray-500 mb-2">
          {safeOptions.length} classe{safeOptions.length > 1 ? 's' : ''} disponible{safeOptions.length > 1 ? 's' : ''}
        </div>
      )}
      
      {/* Liste des classes filtrées */}
      {input.length > 0 && filtered.length > 0 && (
        <div className="border rounded bg-white shadow p-2 mt-1 max-h-48 overflow-y-auto">
          {filtered.map((tag, index) => (
            <div
              key={tag || `filtered-${index}`}
              className="cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
              onClick={() => addTag(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
      
      {/* Message si aucune classe ne correspond à la recherche */}
      {input.length > 0 && filtered.length === 0 && safeOptions.length > 0 && (
        <div className="text-sm text-amber-600 mt-1">
          Aucune classe ne correspond à votre recherche
        </div>
      )}

      {/* Affichage des erreurs */}
      {errorMessage && (
        <div className="text-sm text-red-500 mt-1 p-2 bg-red-50 border border-red-200 rounded flex justify-between items-center">
          <div>
            <span className="font-bold">Erreur:</span> {errorMessage}
          </div>
          <button 
            className="text-xs text-blue-600 hover:text-blue-800 underline"
            onClick={() => {
              setErrorMessage(null);
              if (onRetry) {
                onRetry();
              }
            }}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Message si aucune classe n'est disponible sans erreur */}
      {!errorMessage && safeOptions.length === 0 && (
        <div className="text-sm text-gray-500 mt-1">
          Aucune classe disponible pour le moment
        </div>
      )}
    </div>
  );
}
