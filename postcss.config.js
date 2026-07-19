// Flattens native CSS nesting (used by intl-tel-input's stylesheet) so the
// bundled CSS works on the browser targets Vite builds for. Our own CSS uses
// no nesting, so this is a no-op for it.
import nesting from 'postcss-nesting';

export default {
  plugins: [nesting()]
};
