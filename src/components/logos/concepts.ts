import { archLens } from "./concepts/archLens";
import { doorShutter } from "./concepts/doorShutter";
import { filmVan } from "./concepts/filmVan";
import { hatchFlash } from "./concepts/hatchFlash";
import { headlightLenses } from "./concepts/headlightLenses";
import { instantVan } from "./concepts/instantVan";
import { lineVan } from "./concepts/lineVan";
import { signPrism } from "./concepts/signPrism";
import { vanCutout } from "./concepts/vanCutout";
import { viewfinderVan } from "./concepts/viewfinderVan";
import type { Concept } from "./types";

export const concepts: Concept[] = [
  hatchFlash,
  headlightLenses,
  signPrism,
  doorShutter,
  viewfinderVan,
  vanCutout,
  instantVan,
  filmVan,
  archLens,
  lineVan,
];
