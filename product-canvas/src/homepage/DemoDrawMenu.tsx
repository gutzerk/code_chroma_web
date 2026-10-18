import { useState } from 'react';
import { useEngineClient } from '../engine-client/EngineClientContext';
import { RailButton } from '../canvas/RailButton';
import { RailIcon } from '../icons/RailIcon';
import { BUILTIN_RECIPES, runRecipeAndLayout } from '../canvas/doc/diagramCatalog';

// Drawing normally starts an agent. In the public demo, load the product's prepared examples.
export function DrawDiagramButton() {
  const client = useEngineClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <div className="draw-diagram-button-wrap">
    <RailButton label="Draw…" pressed={open} onClick={() => setOpen(!open)}><RailIcon name="custom" /></RailButton>
    {open && <div className="homepage-draw-menu" role="menu" aria-label="Example diagrams">
      <strong>Example diagrams</strong>
      {BUILTIN_RECIPES.map(recipe => <button key={recipe.name} role="menuitem" disabled={busy} onClick={async () => {
        setBusy(true); setError('');
        try {
          const result = await runRecipeAndLayout(client, recipe.name);
          if (!result.ok) throw new Error(result.error);
          setOpen(false);
        }
        catch (e) { setError(e instanceof Error ? e.message : 'Could not draw diagram'); }
        finally { setBusy(false); }
      }}>{recipe.label}</button>)}
      <button role="menuitem" onClick={() => setOpen(false)}>Close</button>
      {error && <p role="alert">{error}</p>}
    </div>}
  </div>;
}
