UPDATE skills
SET summary = 'Swappable language models for extraction, scoring, or labelling.'
WHERE slug = 'llm';

UPDATE profile SET summary = 'I build self-hosted web apps and the specialised AI assistants that work on them. Featured here: Riksdagskollen, a paper-only trading lab, a pixel-art explainer for codebases, and private tools for deals and housing.';

UPDATE agents SET sort_order = sort_order + 101 WHERE sort_order > 3;
UPDATE agents SET sort_order = sort_order - 100 WHERE sort_order > 100;

INSERT INTO agents (slug, name, owns, summary, sort_order) VALUES
    ('warehouse', 'Warehouse', 'Warehouse', 'Owns the warehouse explainer.', 4);

UPDATE projects SET sort_order = 5 WHERE slug = 'halmstad-homes';

INSERT INTO projects (
    slug, name, summary, body, kind, visibility, sort_order, live_url, repo_url,
    credit_name, credit_url, credit_license
) VALUES (
    'warehouse',
    'Warehouse',
    'A living 2D pixel-art warehouse of a codebase, so a non-coder can see how the software fits together. The repository is private.',
    $body$Warehouse shows a software project as a living 2D pixel-art warehouse, so someone who does not write code can still see how the codebase fits together. External services are Suppliers, cron jobs are Trucks, database tables are Racks, code units are Robots, and the frontend is the Counter.

The view includes a flow map, an isometric floor, and a layout for a phone. The backend is Go. The frontend is a TypeScript canvas built with PixiJS. Types are generated from an OpenAPI contract. An optional language model can label parts of the map using that project's GLOSSARY.md. Deploys go through Argo CD.

The first subject is Riksdagskollen. The repository is private.$body$,
    'standard',
    'private',
    4,
    'https://warehouse.runevibe.se',
    NULL,
    NULL, NULL, NULL
);

INSERT INTO project_facts (project_slug, sort_order, label, value) VALUES
    ('warehouse', 1, 'Metaphor', 'Suppliers, Trucks, Racks, Robots, Counter'),
    ('warehouse', 2, 'First subject', 'Riksdagskollen');

INSERT INTO skill_usages (skill_slug, project_slug) VALUES
    ('go', 'warehouse'),
    ('typescript-react', 'warehouse'),
    ('docker', 'warehouse'),
    ('k3s', 'warehouse'),
    ('helm', 'warehouse'),
    ('argocd', 'warehouse'),
    ('cert-manager', 'warehouse'),
    ('github-actions', 'warehouse'),
    ('openapi', 'warehouse'),
    ('llm', 'warehouse');
