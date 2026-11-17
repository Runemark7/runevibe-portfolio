-- Restore the 000009 riksdagskollen body.
UPDATE projects
SET body = $body$Riksdagskollen is a civic transparency site for the Swedish parliament. It compares what parties and members say in manifestos and debate speeches with how they vote.

The site includes party scorecards, a side-by-side party comparison that sets each party's promises and votes in one subject next to each other, a vote agreement matrix showing how often each pair of parties votes the same, per mandate period, riksmöte, and committee, with the votes where they split, a party-line rebels page listing every ballot a member cast against their party's line, filterable by party, member, riksmöte, committee, and decision day, a decisions feed, vote proposer context, state budget history, and KPI views for regions and municipalities. The data comes from Riksdagen open data, SCB, and Kolada.

An AI layer extracts promises from speeches and scores how relevant a vote is. The model can be swapped, and a keyword matcher is the fallback when no model is configured.

The stack is Go 1.26 (chi, pgx, golang-migrate), React, TypeScript, and Vite, an OpenAPI contract, PostgreSQL, and Helm with Argo CD on k3s.

Ingestion runs daily, with automated freshness alerting. About 4 million individual member votes are in the record: 3,957,311 as of 2026-10-24. Vote history runs from 2002/03.$body$
WHERE slug = 'riksdagskollen';
