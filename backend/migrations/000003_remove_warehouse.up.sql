-- Warehouse is no longer featured. Facts and skill usages cascade from projects.
DELETE FROM projects WHERE slug = 'warehouse';

UPDATE projects SET sort_order = 4 WHERE slug = 'halmstad-homes';

DELETE FROM agents WHERE slug = 'warehouse';

-- sort_order is UNIQUE and at least 1, so shift through a free range.
UPDATE agents SET sort_order = sort_order + 100 WHERE sort_order > 4;
UPDATE agents SET sort_order = sort_order - 101 WHERE sort_order > 100;

UPDATE profile SET summary = 'I build self-hosted web apps and the specialised AI assistants that work on them. Featured here: Riksdagskollen, a paper-only trading lab, and private tools for deals and housing.';

UPDATE skills
SET summary = 'Swappable language models for extraction or scoring.'
WHERE slug = 'llm';
