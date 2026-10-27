# PatternFly stays behind the ui layer

Pages and features do not import PatternFly. A `ui/` layer owns those imports, and ESLint rejects `@patternfly/*` everywhere else. PatternFly is the design system for this version, but the pages are written against our wrappers so a later swap does not rewrite the portfolio. Importing PatternFly from each page would have been faster and would have made that swap a rewrite.
