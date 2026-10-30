-- The cited library grew from 15 to 32. Production scored all 32 under gate v7b on 2026-10-30: 7 pass, 6 seated after a manual approval.
UPDATE projects
SET
    summary = 'Paper-only BTC research that scores a library of 32 published strategies and only proposes ones that stay positive after fees out of sample and on a sealed holdout. Six are seated as paper forward tests after a manual approval. No real money.',
    body = $body$The paper trading bot researches BTC strategies on paper. It does not place real orders and it does not handle real money. Each champion trades its own isolated paper account that starts at 10,000, and the book cycles every 5 minutes.

Discovery scores a pre-registered library of 32 published, cited strategies on daily BTC bars. A second batch of 17 was added to the original 15. A position is long or flat. Examples include RSI(2), SMA 100 and SMA 200 trend filters, a golden cross, MACD, time-series momentum over 1 week, 3 months, 6 months, and 12 months, a Turtle 55-day breakout, and Faber 10-month. It uses a signal-exit engine and one 20% stop. Indicators are warmed from BTC history starting 2017-08-17. Random strategy minting is no longer the default.

The gate is v7b, dated 2026-10-29. A pass requires positive net P&L after fees and slippage (a 0.1% fee and 2 basis points) out of sample from 2018-12-01 to 2025-09-30, and positive net P&L on a sealed holdout from 2025-10-01 to 2026-10-01. Both results have to stay positive at twice the fees and 5 basis points. It also needs at least 8 out-of-sample round trips and at least 2 holdout trades. Deflated Sharpe, the probability of backtest overfitting, Sharpe floors, parameter-neighbour checks, and the comparison with buy-and-hold are computed and shown as warnings. They are not vetoes. A pass is only proposed. Seating a champion takes a manual approval, and a pass is never seated on its own.

As of 2026-10-30, all 32 library strategies have been tested and 7 pass. Six are seated as paper forward-test champions after a manual approval: lib.rsi2 (RSI(2)), lib.sma200 (SMA 200), lib.ichimoku (Ichimoku), lib.rsi14 (RSI(14)), lib.tsmom180d (180-day time-series momentum), and lib.rsi2_10 (RSI(2) below 10). lib.sma100 (SMA 100) is the other pass, and it stays an unproven forward test.

Before the library switch, the earlier random search had tested 35,667 unique strategy candidates. When the gate was tightened in early October 2026, all 127 earlier champions were retested and retired.

The stack is Python (pandas, ccxt), a React dashboard, and k3s with Argo CD. Continuous integration builds the image and the deploy pins the commit. The project is built on virattt/ai-hedge-fund (MIT).$body$
WHERE slug = 'paper-trading-bot';

DELETE FROM project_facts WHERE project_slug = 'paper-trading-bot';

INSERT INTO project_facts (project_slug, sort_order, label, value) VALUES
    ('paper-trading-bot', 1, 'Discovery', 'Library of 32 cited strategies on daily BTC'),
    ('paper-trading-bot', 2, 'Passed', '7 of 32 as of 2026-10-30'),
    ('paper-trading-bot', 3, 'Gate', 'Positive net P&L after a 0.1% fee + 2 bps, out of sample from 2018-12-01 to 2025-09-30 and on a sealed holdout from 2025-10-01 to 2026-10-01, both still positive at 2x fees + 5 bps; at least 8 out-of-sample round trips and 2 holdout trades'),
    ('paper-trading-bot', 4, 'Earlier search', '35,667 candidates tested before the library switch'),
    ('paper-trading-bot', 5, 'Markets', 'Paper-only BTC. No real money.');
