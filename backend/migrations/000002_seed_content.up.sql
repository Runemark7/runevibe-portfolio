INSERT INTO profile (name, headline, summary, github_url, linkedin_url)
VALUES (
    'Alexander Runemark',
    'Go + TypeScript engineer shipping self-hosted apps with AI agents',
    'I build self-hosted web apps and the specialised AI assistants that work on them. Featured here: Riksdagskollen, a paper-only trading lab, a pixel-art explainer for codebases, and private tools for deals and housing.',
    'https://github.com/Runemark7',
    NULL
);

INSERT INTO projects (
    slug, name, summary, body, kind, visibility, sort_order, live_url, repo_url,
    credit_name, credit_url, credit_license
) VALUES
(
    'riksdagskollen',
    'Riksdagskollen',
    'Civic transparency site for the Swedish parliament. Compares what parties and members say with how they vote.',
    $body$Riksdagskollen is a civic transparency site for the Swedish parliament. It compares what parties and members say in manifestos and debate speeches with how they vote.

The site includes party scorecards, a decisions feed, vote proposer context, state budget history, and KPI views for regions and municipalities. The data comes from Riksdagen open data, SCB, and Kolada.

An AI layer extracts promises from speeches and scores how relevant a vote is. The model can be swapped, and a keyword matcher is the fallback when no model is configured.

The stack is Go 1.26 (chi, pgx, golang-migrate), React, TypeScript, and Vite, an OpenAPI contract, PostgreSQL, and Helm with Argo CD on k3s.

Ingestion runs daily, with automated freshness alerting. About 4 million individual member votes are in the record: 3,957,311 as of 2026-10-24. Vote history runs from 2002/03.$body$,
    'flagship',
    'public',
    1,
    'https://sdt.runevibe.se',
    'https://github.com/Runemark7/swedish-democratic-tracker',
    NULL, NULL, NULL
),
(
    'dealradar',
    'DealRadar',
    'AI-powered deal finder for Blocket.se. Listings are scraped, stored, scored, and notified on. The repository is private.',
    $body$DealRadar is an AI-powered deal finder for Blocket.se. It scrapes listings, tracks them in PostgreSQL, and asks a model to score each listing from 1 to 10. A notification goes out for the listings that score well. Tradera market prices are used as price context. People create deal requests and subscriptions.

The original application is Python and Flask, with n8n for the surrounding automation. A Go rewrite is in progress: hexagonal architecture, an OpenAPI contract, an event bus, and a React and TypeScript client.

The repository is private, and there is no public deployment to link.$body$,
    'main',
    'private',
    2,
    NULL,
    NULL,
    NULL, NULL, NULL
),
(
    'paper-trading-bot',
    'Paper Trading Bot',
    'Paper-only BTC and ETH research. Strategies are generated, backtested, and kept only when they clear a frozen walk-forward gate. No real money.',
    $body$The paper trading bot searches for BTC and ETH strategies on paper. It does not place real orders and it does not handle real money.

Mint is a deterministic generator. It builds AND-combinations of indicator conditions, at most seven conditions each, and it only adds a new family of conditions from peer-reviewed research. Farm is a set of stateless workers that lease candidates and backtest them.

A frozen walk-forward gate decides what may be called a pass: 23 out-of-sample windows covering about 5.7 years, at least 30 trades, a Sharpe ratio of at least 0.30, and a result that beats both a moving-average baseline and buy-and-hold.

As of 2026-10-27, 18,867 strategies had been backtested and 122 had passed, about 0.6 percent. When the gate was tightened in early October 2026, all 127 earlier champions were retested and retired. The gate is preferred over a longer list of winners.

The stack is Python (pandas, ccxt), a React dashboard, and k3s with Argo CD. Continuous integration builds the image and the deploy pins the commit. The project is built on virattt/ai-hedge-fund (MIT).$body$,
    'standard',
    'public',
    3,
    'https://trading.runevibe.se',
    'https://github.com/Runemark7/paper-trading-bot',
    'virattt/ai-hedge-fund',
    'https://github.com/virattt/ai-hedge-fund',
    'MIT'
),
(
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
),
(
    'halmstad-homes',
    'Halmstad homes map',
    'A map of homes for sale in Halmstad. The repository is private.',
    $body$A map of homes for sale in Halmstad. The client is Vite, Leaflet, and TypeScript. The API is Node and TypeScript. Data sits in PostgreSQL. The deploy is Helm and Argo CD.

The repository is private.$body$,
    'smaller',
    'private',
    5,
    'https://house.runevibe.se',
    NULL,
    NULL, NULL, NULL
);

INSERT INTO project_facts (project_slug, sort_order, label, value) VALUES
    ('riksdagskollen', 1, 'Individual member votes', '3,957,311 as of 2026-10-24 (about 4 million)'),
    ('riksdagskollen', 2, 'Vote history', 'From 2002/03'),
    ('riksdagskollen', 3, 'Data', 'Riksdagen open data, SCB, Kolada'),
    ('riksdagskollen', 4, 'Ingestion', 'Daily, with automated freshness alerting'),
    ('dealradar', 1, 'Listing score', '1 to 10, then a notification'),
    ('dealradar', 2, 'Price context', 'Tradera market prices'),
    ('dealradar', 3, 'Rewrite', 'Go, hexagonal, OpenAPI-first, event bus, React/TypeScript — in progress'),
    ('paper-trading-bot', 1, 'Backtested', '18,867 strategies as of 2026-10-27'),
    ('paper-trading-bot', 2, 'Passed the gate', '122 (about 0.6%)'),
    ('paper-trading-bot', 3, 'Retired champions', '127 retested and retired when the gate was tightened in early October 2026'),
    ('paper-trading-bot', 4, 'Gate', '23 out-of-sample windows over about 5.7 years; at least 30 trades; Sharpe at least 0.30; must beat a moving-average baseline and buy-and-hold'),
    ('paper-trading-bot', 5, 'Markets', 'Paper-only BTC and ETH. No real money.'),
    ('warehouse', 1, 'Metaphor', 'Suppliers, Trucks, Racks, Robots, Counter'),
    ('warehouse', 2, 'First subject', 'Riksdagskollen'),
    ('halmstad-homes', 1, 'Place', 'Halmstad'),
    ('halmstad-homes', 2, 'Subject', 'Homes for sale');

INSERT INTO skills (slug, name, summary, category, basis, sort_order) VALUES
    ('go', 'Go', 'Backend language.', 'language', 'projects', 1),
    ('typescript-react', 'TypeScript/React', 'TypeScript user interfaces, including React apps.', 'language', 'projects', 2),
    ('python', 'Python', 'Application and research language.', 'language', 'projects', 3),
    ('postgresql', 'PostgreSQL', 'Relational database.', 'data', 'projects', 4),
    ('docker', 'Docker', 'Container images.', 'platform', 'projects', 5),
    ('k3s', 'k3s/Kubernetes', 'Kubernetes distribution used for the cluster.', 'platform', 'projects', 6),
    ('helm', 'Helm', 'Kubernetes package manager.', 'delivery', 'projects', 7),
    ('argocd', 'Argo CD GitOps', 'GitOps controller for Helm releases.', 'delivery', 'projects', 8),
    ('cert-manager', 'cert-manager', 'Certificate controller for Let''s Encrypt on the cluster.', 'delivery', 'projects', 9),
    ('github-actions', 'GitHub Actions', 'Continuous integration.', 'delivery', 'projects', 10),
    ('openapi', 'OpenAPI-first', 'API contract as the source of generated types.', 'practice', 'projects', 11),
    ('hexagonal', 'hexagonal architecture', 'Domain core isolated behind ports and adapters.', 'practice', 'projects', 12),
    ('n8n', 'n8n', 'Workflow automation.', 'tooling', 'projects', 13),
    ('llm', 'LLM integrations', 'Swappable language models for extraction, scoring, or labelling.', 'tooling', 'projects', 14),
    ('arch', 'Arch Linux', 'Daily desktop.', 'desktop', 'daily_driver', 15);

INSERT INTO skill_usages (skill_slug, project_slug) VALUES
    ('go', 'riksdagskollen'),
    ('go', 'dealradar'),
    ('go', 'warehouse'),
    ('typescript-react', 'riksdagskollen'),
    ('typescript-react', 'dealradar'),
    ('typescript-react', 'paper-trading-bot'),
    ('typescript-react', 'warehouse'),
    ('typescript-react', 'halmstad-homes'),
    ('python', 'dealradar'),
    ('python', 'paper-trading-bot'),
    ('postgresql', 'riksdagskollen'),
    ('postgresql', 'dealradar'),
    ('postgresql', 'halmstad-homes'),
    ('docker', 'riksdagskollen'),
    ('docker', 'paper-trading-bot'),
    ('docker', 'warehouse'),
    ('docker', 'halmstad-homes'),
    ('k3s', 'riksdagskollen'),
    ('k3s', 'dealradar'),
    ('k3s', 'paper-trading-bot'),
    ('k3s', 'warehouse'),
    ('k3s', 'halmstad-homes'),
    ('helm', 'riksdagskollen'),
    ('helm', 'dealradar'),
    ('helm', 'paper-trading-bot'),
    ('helm', 'warehouse'),
    ('helm', 'halmstad-homes'),
    ('argocd', 'riksdagskollen'),
    ('argocd', 'dealradar'),
    ('argocd', 'paper-trading-bot'),
    ('argocd', 'warehouse'),
    ('argocd', 'halmstad-homes'),
    ('cert-manager', 'riksdagskollen'),
    ('cert-manager', 'paper-trading-bot'),
    ('cert-manager', 'warehouse'),
    ('cert-manager', 'halmstad-homes'),
    ('github-actions', 'riksdagskollen'),
    ('github-actions', 'paper-trading-bot'),
    ('github-actions', 'warehouse'),
    ('github-actions', 'halmstad-homes'),
    ('openapi', 'riksdagskollen'),
    ('openapi', 'dealradar'),
    ('openapi', 'warehouse'),
    ('hexagonal', 'dealradar'),
    ('n8n', 'dealradar'),
    ('llm', 'riksdagskollen'),
    ('llm', 'dealradar'),
    ('llm', 'warehouse');

INSERT INTO agents (slug, name, owns, summary, sort_order) VALUES
    ('chief-of-staff', 'Chief of Staff', 'The fleet', 'Coordinates the other agents.', 1),
    ('paper-trader', 'Paper Trader', 'Paper Trading Bot', 'Owns the paper-trading bot.', 2),
    ('democracy-tracker', 'Democracy Tracker', 'Riksdagskollen', 'Owns Riksdagskollen.', 3),
    ('warehouse', 'Warehouse', 'Warehouse', 'Owns the warehouse explainer.', 4),
    ('apartment-finder', 'Apartment Finder', 'Apartment search', 'Owns the apartment-finding job.', 5),
    ('parking-watcher', 'Parking watcher', 'Parking watch', 'Owns the parking-watcher job.', 6),
    ('portfolio', 'Portfolio', 'This portfolio', 'Owns this portfolio site.', 7);

INSERT INTO workflow_steps (slug, name, summary, sort_order) VALUES
    ('grill-me', 'grill-me', 'Question the idea until the language is sharp.', 1),
    ('to-spec', 'to-spec', 'Write the specification from that language.', 2),
    ('to-tickets', 'to-tickets', 'Break the specification into tickets.', 3),
    ('implement-tdd', 'implement/tdd', 'Implement the tickets with tests.', 4),
    ('code-review', 'code-review', 'Review the resulting change.', 5),
    ('pr', 'pr', 'Cursor cloud agents open the pull request. A code review, by Alexander or a review agent, happens before merge.', 6);

INSERT INTO site_copy (key, value) VALUES (
    'workflow_summary',
    'A fleet of specialised assistants, each owning one project or one job, coordinate with each other. The coding workflow follows Matt Pocock''s skills, in this order. Cursor cloud agents open the pull requests. Each pull request gets a code review, by Alexander or a review agent, before merge.'
);

INSERT INTO infra_notes (slug, title, summary, sort_order) VALUES
    ('k3s', 'k3s', 'Single-node k3s on Hetzner.', 1),
    ('argocd', 'Argo CD', 'GitOps with Argo CD. Each repository ships its own Helm chart and Application.', 2),
    ('cert-manager', 'cert-manager', 'cert-manager issues Let''s Encrypt certificates.', 3),
    ('ghcr', 'GHCR', 'Container images are published to GitHub Container Registry.', 4),
    ('postgres', 'PostgreSQL', 'PostgreSQL runs on a separate VPS, outside the cluster.', 5),
    ('arch', 'Arch Linux', 'The desktop is Arch Linux.', 6);
