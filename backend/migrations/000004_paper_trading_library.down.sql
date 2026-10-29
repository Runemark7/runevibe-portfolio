-- Restore the 000002 paper-trading-bot summary, body, and facts.
UPDATE projects
SET
    summary = 'Paper-only BTC and ETH research. Strategies are generated, backtested, and kept only when they clear a frozen walk-forward gate. No real money.',
    body = $body$The paper trading bot searches for BTC and ETH strategies on paper. It does not place real orders and it does not handle real money.

Mint is a deterministic generator. It builds AND-combinations of indicator conditions, at most seven conditions each, and it only adds a new family of conditions from peer-reviewed research. Farm is a set of stateless workers that lease candidates and backtest them.

A frozen walk-forward gate decides what may be called a pass: 23 out-of-sample windows covering about 5.7 years, at least 30 trades, a Sharpe ratio of at least 0.30, and a result that beats both a moving-average baseline and buy-and-hold.

As of 2026-10-27, 18,867 strategies had been backtested and 122 had passed, about 0.6 percent. When the gate was tightened in early October 2026, all 127 earlier champions were retested and retired. The gate is preferred over a longer list of winners.

The stack is Python (pandas, ccxt), a React dashboard, and k3s with Argo CD. Continuous integration builds the image and the deploy pins the commit. The project is built on virattt/ai-hedge-fund (MIT).$body$
WHERE slug = 'paper-trading-bot';

DELETE FROM project_facts WHERE project_slug = 'paper-trading-bot';

INSERT INTO project_facts (project_slug, sort_order, label, value) VALUES
    ('paper-trading-bot', 1, 'Backtested', '18,867 strategies as of 2026-10-27'),
    ('paper-trading-bot', 2, 'Passed the gate', '122 (about 0.6%)'),
    ('paper-trading-bot', 3, 'Retired champions', '127 retested and retired when the gate was tightened in early October 2026'),
    ('paper-trading-bot', 4, 'Gate', '23 out-of-sample windows over about 5.7 years; at least 30 trades; Sharpe at least 0.30; must beat a moving-average baseline and buy-and-hold'),
    ('paper-trading-bot', 5, 'Markets', 'Paper-only BTC and ETH. No real money.');
