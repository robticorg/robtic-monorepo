import { createContext, useContext } from 'react';

/**
 * `static` is used when rendering the downloadable HTML export: there is no
 * JavaScript in the file, so spoilers are revealed and edit histories expanded.
 */
export const StaticRenderContext = createContext(false);
export const useStaticRender = (): boolean => useContext(StaticRenderContext);
