-- The cited library is now 251 strategies. Live trading.runevibe.se on 2026-11-14 scored all 251 under gate v7b: 44 pass, all seated automatically, plus dip_234b and dip_240b, for 46 champions.
UPDATE projects
SET
    summary = 'Paper-only BTC research that scores a library of 251 published strategies and automatically seats each library pass that stays positive after fees out of sample and on a sealed holdout. 44 of 251 pass, and 46 champions trade on paper. No real money.',
    body = $body$The paper trading bot researches BTC strategies on paper. It does not place real orders and it does not handle real money. Each champion trades its own isolated paper account that starts at 10,000, and the book cycles every 5 minutes.

Discovery scores a pre-registered library of 251 published, cited strategies on daily BTC bars. A position is long or flat. Examples include RSI(2), SMA 100 and SMA 200 trend filters, Ichimoku, RSI(14), and 180-day time-series momentum. It uses a signal-exit engine and one 20% stop. Indicators are warmed from BTC history starting 2017-08-17. Random strategy minting is no longer the default.

The gate is v7b, dated 2026-10-29. A pass requires positive net P&L after fees and slippage (a 0.1% fee and 2 basis points) out of sample from 2018-12-01 to 2025-09-30, and positive net P&L on a sealed holdout from 2025-10-01 to 2026-10-01. Both results have to stay positive at twice the fees and 5 basis points. It also needs at least 8 out-of-sample round trips and at least 2 holdout trades. Deflated Sharpe, the probability of backtest overfitting, Sharpe floors, parameter-neighbour checks, and the comparison with buy-and-hold are computed and shown as warnings. They are not vetoes. Since 2026-11-01, a canonical library pass is seated automatically as a paper forward-test champion. A 5-minute pass stays proposed and is not seated on its own.

As of 2026-11-14, all 251 library strategies have been tested and 44 pass. All 44 library passes are seated as paper forward-test champions.

Before the library switch, the earlier random search had tested 35,667 unique strategy candidates. When the gate was tightened in early October 2026, all 127 earlier champions were retested and retired. Two 5-minute champions from that earlier search, dip_234b and dip_240b, were admitted afterwards on 2026-10-09 under the gate of that time and still trade on paper, so 46 champions run in total.

The stack is Python (pandas, ccxt), a React dashboard, and k3s with Argo CD. Continuous integration builds the image and the deploy pins the commit. The project is built on virattt/ai-hedge-fund (MIT).$body$
WHERE slug = 'paper-trading-bot';

DELETE FROM project_facts WHERE project_slug = 'paper-trading-bot';

INSERT INTO project_facts (project_slug, sort_order, label, value) VALUES
    ('paper-trading-bot', 1, 'Discovery', 'Library of 251 cited strategies on daily BTC'),
    ('paper-trading-bot', 2, 'Passed', '44 of 251 as of 2026-11-14'),
    ('paper-trading-bot', 3, 'Champions', '46 (44 library passes, plus dip_234b and dip_240b)'),
    ('paper-trading-bot', 4, 'Gate', 'Positive net P&L after a 0.1% fee + 2 bps, out of sample from 2018-12-01 to 2025-09-30 and on a sealed holdout from 2025-10-01 to 2026-10-01, both still positive at 2x fees + 5 bps; at least 8 out-of-sample round trips and 2 holdout trades'),
    ('paper-trading-bot', 5, 'Earlier search', '35,667 candidates tested before the library switch'),
    ('paper-trading-bot', 6, 'Markets', 'Paper-only BTC. No real money.');
