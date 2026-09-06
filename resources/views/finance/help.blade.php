<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Bookkeeper's Field Manual</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Source+Serif+4:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
  :root {
    --paper: #f4f7f1;
    --paper-alt: #e9efe4;
    --paper-line: #cddac6;
    --ink: #1e2a22;
    --ink-soft: #4b5a4f;
    --ink-faint: #7c8b7f;
    --accent: #2c3e6b;
    --accent-soft: #d9e0ef;
    --credit: #2f6f5e;
    --credit-soft: #dcece6;
    --caution: #a84a34;
    --caution-soft: #f3ddd5;
    --card: #ffffff;
    --shadow: 0 1px 2px rgba(30, 42, 34, 0.06), 0 8px 24px rgba(30, 42, 34, 0.05);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --paper: #121a15;
      --paper-alt: #1a251d;
      --paper-line: #2c3b2e;
      --ink: #e6ede3;
      --ink-soft: #b6c4b4;
      --ink-faint: #7f9280;
      --accent: #8fa3dd;
      --accent-soft: #253154;
      --credit: #6cc2a6;
      --credit-soft: #1b3730;
      --caution: #e08a6d;
      --caution-soft: #3c261f;
      --card: #182219;
      --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.35);
    }
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }

  body {
    margin: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
    font-size: 17px;
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, .stamp, .brand-mark, nav .idx-num {
    font-family: "Fraunces", Georgia, serif;
    text-wrap: balance;
  }

  code, .mono, .ledger-table, .figure, .idx-num, .kbd {
    font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
    font-variant-numeric: tabular-nums;
  }

  a { color: var(--accent); }
  a:focus-visible, button:focus-visible, summary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  img.wordmark { height: 22px; width: auto; display: block; }

  /* ---------- Shell layout ---------- */
  .shell {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    max-width: 1200px;
    margin: 0 auto;
  }

  .sidebar {
    position: sticky;
    top: 0;
    align-self: start;
    height: 100vh;
    overflow-y: auto;
    padding: 28px 22px 40px;
    border-right: 1px solid var(--paper-line);
  }

  .brand {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 4px;
  }
  .brand-mark {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--accent);
  }
  .brand-sub {
    font-size: 11px;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin: 0 0 26px;
  }

  .home-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: var(--ink-faint);
    text-decoration: none;
    margin-bottom: 18px;
  }
  .home-link:hover { color: var(--accent); }

  nav.toc { display: flex; flex-direction: column; gap: 1px; }
  nav.toc a {
    display: flex;
    gap: 10px;
    align-items: baseline;
    text-decoration: none;
    color: var(--ink-soft);
    padding: 7px 8px;
    border-radius: 3px;
    font-size: 14.5px;
    line-height: 1.35;
  }
  nav.toc a:hover { background: var(--paper-alt); color: var(--ink); }
  nav.toc a.active { background: var(--accent-soft); color: var(--accent); font-weight: 600; }
  nav.toc .idx-num {
    font-size: 12px;
    color: var(--ink-faint);
    min-width: 20px;
  }
  nav.toc a.active .idx-num { color: var(--accent); }

  .toc-divider {
    margin: 16px 4px 10px;
    font-size: 10.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faint);
    border-top: 1px solid var(--paper-line);
    padding-top: 14px;
  }
  .toc-divider:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }

  main {
    padding: 56px clamp(24px, 5vw, 72px) 120px;
    min-width: 0;
  }

  .masthead {
    max-width: 640px;
    margin-bottom: 56px;
    padding-bottom: 32px;
    border-bottom: 2px solid var(--ink);
  }
  .masthead .eyebrow {
    font-family: "IBM Plex Mono", monospace;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--caution);
    margin: 0 0 14px;
  }
  .masthead h1 {
    font-size: clamp(32px, 4.4vw, 46px);
    font-weight: 600;
    line-height: 1.08;
    margin: 0 0 16px;
    color: var(--ink);
  }
  .masthead p { font-size: 18px; color: var(--ink-soft); max-width: 60ch; margin: 0 0 8px; }
  .masthead .lede-note { font-size: 15px; color: var(--ink-faint); font-style: italic; }

  section.chapter {
    max-width: 680px;
    margin-bottom: 68px;
    scroll-margin-top: 24px;
  }
  section.chapter > .chapter-head {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin-bottom: 22px;
  }
  section.chapter .chapter-num {
    font-family: "IBM Plex Mono", monospace;
    font-size: 14px;
    color: var(--ink-faint);
    border: 1px solid var(--paper-line);
    border-radius: 999px;
    padding: 3px 11px;
    flex-shrink: 0;
  }
  section.chapter h2 {
    font-size: 27px;
    font-weight: 600;
    margin: 0;
    color: var(--ink);
  }
  section.chapter h3 {
    font-size: 19px;
    font-weight: 600;
    margin: 32px 0 12px;
    color: var(--ink);
  }
  section.chapter p { margin: 0 0 16px; }
  section.chapter ul, section.chapter ol { margin: 0 0 16px; padding-left: 1.3em; }
  section.chapter li { margin-bottom: 7px; }
  section.chapter strong { color: var(--ink); }

  hr.rule {
    border: none;
    border-top: 1px solid var(--paper-line);
    margin: 34px 0;
  }

  /* ---------- Stamp-style callouts ---------- */
  .stamp-box {
    border: 1.5px solid var(--ink-faint);
    border-left: 4px solid var(--accent);
    background: var(--card);
    border-radius: 4px;
    padding: 16px 20px;
    margin: 22px 0;
    box-shadow: var(--shadow);
  }
  .stamp-box.caution { border-left-color: var(--caution); }
  .stamp-box.credit { border-left-color: var(--credit); }
  .stamp {
    display: inline-block;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
  }
  .stamp-box.caution .stamp { color: var(--caution); }
  .stamp-box.credit .stamp { color: var(--credit); }
  .stamp-box p:last-child { margin-bottom: 0; }

  /* ---------- Ledger tables (worked examples) ---------- */
  .ledger-frame {
    margin: 20px 0 28px;
    border: 1px solid var(--paper-line);
    border-radius: 6px;
    overflow: hidden;
    background: var(--card);
    box-shadow: var(--shadow);
  }
  .ledger-frame .ledger-title {
    font-family: "Fraunces", serif;
    font-weight: 600;
    font-size: 15px;
    padding: 12px 16px;
    background: var(--paper-alt);
    border-bottom: 1px solid var(--paper-line);
    color: var(--ink);
  }
  table.ledger-table { width: 100%; border-collapse: collapse; font-size: 14.5px; }
  table.ledger-table th, table.ledger-table td {
    padding: 10px 16px;
    text-align: left;
    border-bottom: 1px solid var(--paper-line);
  }
  table.ledger-table thead th {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-faint);
    font-weight: 600;
    background: var(--paper);
  }
  table.ledger-table td.num, table.ledger-table th.num { text-align: right; }
  table.ledger-table tr:last-child td { border-bottom: none; }
  table.ledger-table tr.total td { font-weight: 600; border-top: 2px solid var(--ink); }
  table.ledger-table .acct-code { color: var(--ink-faint); margin-right: 8px; }

  .flow-steps {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin: 18px 0 26px;
    font-family: "IBM Plex Mono", monospace;
    font-size: 13px;
  }
  .flow-steps .step {
    background: var(--paper-alt);
    border: 1px solid var(--paper-line);
    border-radius: 999px;
    padding: 6px 14px;
    color: var(--ink-soft);
  }
  .flow-steps .arrow { color: var(--ink-faint); }

  .screen-map {
    display: grid;
    gap: 10px;
    margin: 18px 0 26px;
  }
  .screen-map .row {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--paper-line);
    align-items: baseline;
  }
  .screen-map .row:last-child { border-bottom: none; }
  .screen-map .label {
    font-family: "IBM Plex Mono", monospace;
    font-size: 12.5px;
    color: var(--accent);
    font-weight: 600;
  }

  /* ---------- Definition / glossary ---------- */
  dl.glossary { margin: 0; }
  dl.glossary > div {
    padding: 16px 0;
    border-bottom: 1px solid var(--paper-line);
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 18px;
  }
  dl.glossary > div:last-child { border-bottom: none; }
  dl.glossary dt { font-family: "Fraunces", serif; font-weight: 600; color: var(--ink); }
  dl.glossary dd { margin: 0; color: var(--ink-soft); }

  /* ---------- Checklist ---------- */
  .checklist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 18px;
    margin: 20px 0 10px;
  }
  .checklist-card {
    background: var(--card);
    border: 1px solid var(--paper-line);
    border-radius: 6px;
    padding: 18px;
    box-shadow: var(--shadow);
  }
  .checklist-card h4 {
    margin: 0 0 12px;
    font-family: "IBM Plex Mono", monospace;
    font-size: 11.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
  .checklist-card ul { margin: 0; padding-left: 1.1em; font-size: 14.5px; }
  .checklist-card li { margin-bottom: 8px; }

  /* ---------- Mistakes field guide ---------- */
  .mistake {
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 14px;
    padding: 18px 0;
    border-bottom: 1px solid var(--paper-line);
  }
  .mistake:last-child { border-bottom: none; }
  .mistake .no {
    font-family: "IBM Plex Mono", monospace;
    font-weight: 600;
    color: var(--caution);
    font-size: 20px;
    line-height: 1.2;
  }
  .mistake h4 { margin: 0 0 6px; font-size: 16px; color: var(--ink); }
  .mistake p { margin: 0; font-size: 15px; color: var(--ink-soft); }
  .mistake .fix { margin-top: 8px; font-size: 14px; color: var(--credit); }
  .mistake .fix::before { content: "→ "; }

  .cheat-table { width: 100%; border-collapse: collapse; font-size: 14.5px; margin: 18px 0; }
  .cheat-table th, .cheat-table td { padding: 11px 14px; border-bottom: 1px solid var(--paper-line); text-align: left; vertical-align: top; }
  .cheat-table thead th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-faint); }
  .cheat-table td.where { font-family: "IBM Plex Mono", monospace; font-size: 13px; color: var(--accent); white-space: nowrap; }

  .back-to-top {
    position: fixed;
    right: 28px;
    bottom: 28px;
    background: var(--accent);
    color: var(--paper);
    border: none;
    border-radius: 999px;
    width: 44px;
    height: 44px;
    font-size: 18px;
    cursor: pointer;
    box-shadow: var(--shadow);
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
  }
  .back-to-top.show { opacity: 1; transform: translateY(0); pointer-events: auto; }

  footer.colophon {
    max-width: 680px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--paper-line);
    color: var(--ink-faint);
    font-size: 13.5px;
  }

  @media (max-width: 880px) {
    .shell { grid-template-columns: 1fr; }
    .sidebar { position: static; height: auto; border-right: none; border-bottom: 1px solid var(--paper-line); }
    main { padding: 40px 20px 100px; }
    .screen-map .row, dl.glossary > div { grid-template-columns: 1fr; gap: 4px; }
  }

  @media print {
    .sidebar, .back-to-top { display: none; }
    .shell { display: block; }
    body { background: #fff; color: #000; font-size: 12px; }
    section.chapter { page-break-inside: avoid; }
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .back-to-top { transition: none; }
  }
</style>
</head>
<body>

<div class="shell">
  <aside class="sidebar">
    <a href="{{ url('/finance') }}" class="home-link">&larr; Back to DPS-ERP</a>
    <div class="brand">
      <span class="brand-mark">DPS Finance</span>
    </div>
    <p class="brand-sub">Field Manual &middot; No Prior Training Required</p>
    <nav class="toc" id="toc">
      <div class="toc-divider">Start here</div>
      <a href="#why"><span class="idx-num">00</span>Why this matters</a>
      <a href="#buckets"><span class="idx-num">01</span>The five buckets</a>
      <a href="#debit-credit"><span class="idx-num">02</span>Debit &amp; credit, demystified</a>
      <div class="toc-divider">Working the system</div>
      <a href="#chart"><span class="idx-num">03</span>Chart of Accounts</a>
      <a href="#transactions"><span class="idx-num">04</span>Recording money in &amp; out</a>
      <a href="#cashbank"><span class="idx-num">05</span>Cash &amp; Bank</a>
      <a href="#receivable"><span class="idx-num">06</span>When a customer owes you</a>
      <a href="#payable"><span class="idx-num">07</span>When you owe a supplier</a>
      <a href="#ledger"><span class="idx-num">08</span>The General Ledger</a>
      <a href="#assets"><span class="idx-num">09</span>Company property</a>
      <a href="#reports"><span class="idx-num">10</span>Reading the reports</a>
      <div class="toc-divider">Reference</div>
      <a href="#routine"><span class="idx-num">11</span>Your routine</a>
      <a href="#mistakes"><span class="idx-num">12</span>Field guide to mistakes</a>
      <a href="#cheatsheet"><span class="idx-num">13</span>Cheat sheet</a>
      <a href="#glossary"><span class="idx-num">14</span>Glossary</a>
    </nav>
  </aside>

  <main>
    <div class="masthead">
      <p class="eyebrow">Statutory bookkeeping &middot; Ghana Cedi (GH₵)</p>
      <h1>The Bookkeeper's Field Manual</h1>
      <p>You didn't train as an accountant, but the law doesn't check for a certificate — it checks the books. This manual teaches you exactly enough real bookkeeping to keep DPS's accounts honest, plus a screen-by-screen walkthrough of the Finance module so you always know which button does what.</p>
      <p class="lede-note">Read chapters 00–02 once, properly. After that, treat the rest as a shelf reference — come back to the exact chapter when a screen is in front of you.</p>
    </div>

    <section class="chapter" id="why">
      <div class="chapter-head"><span class="chapter-num">00</span><h2>Why this matters</h2></div>
      <p>Every business that sells goods or services, hires staff, or registers with a tax authority is legally required to keep accurate financial records — not as an accounting nicety, but as a statutory duty. If the Ghana Revenue Authority, an auditor, or a bank ever asks "show me," the answer has to come from real records, not memory.</p>
      <p>The good news: you don't need a finance degree to do this correctly. You need to understand a small number of ideas — really understand them, not just click through them — and then follow the system consistently. This manual is built in that order: three short chapters of theory, then the rest is "which screen, which button, what it means."</p>
      <div class="stamp-box">
        <span class="stamp">The one rule that matters most</span>
        <p>Every transaction touches <strong>two</strong> places in the books, never one. Money doesn't appear or disappear — it always moves <em>from</em> something <em>to</em> something. If you remember nothing else from this manual, remember that a Ghana Cedi never travels alone.</p>
      </div>
    </section>

    <section class="chapter" id="buckets">
      <div class="chapter-head"><span class="chapter-num">01</span><h2>The five buckets</h2></div>
      <p>Every Cedi in the business belongs in exactly one of five buckets. The whole Finance module — every screen, every report — is just different views of these five buckets and the entries that move money between them.</p>
      <div class="screen-map">
        <div class="row"><span class="label">ASSET</span><span>What the business <strong>owns</strong>: cash in the drawer, money in the GCB account, MTN MoMo balance, money customers owe you, the printer, the delivery van.</span></div>
        <div class="row"><span class="label">LIABILITY</span><span>What the business <strong>owes</strong>: unpaid supplier bills, a bank loan, taxes collected but not yet paid over.</span></div>
        <div class="row"><span class="label">EQUITY</span><span>What's left over for the <strong>owner</strong> once you subtract liabilities from assets — the owner's stake in the business.</span></div>
        <div class="row"><span class="label">INCOME</span><span>Money <strong>earned</strong>: a printing job, a design fee, a photography booking.</span></div>
        <div class="row"><span class="label">EXPENSE</span><span>Money <strong>spent</strong> to run the business: rent, salaries, materials, electricity.</span></div>
      </div>
      <p>In the app these five buckets are called <strong>account types</strong>, and every account you'll ever see in the Chart of Accounts is one of these five, nothing else.</p>
    </section>

    <section class="chapter" id="debit-credit">
      <div class="chapter-head"><span class="chapter-num">02</span><h2>Debit &amp; credit, demystified</h2></div>
      <p>Forget what "debit card" and "credit card" have taught you — in bookkeeping, <strong>debit</strong> and <strong>credit</strong> just mean "left side" and "right side" of an entry. Neither one is good or bad. The only thing that matters is which side makes <em>your</em> bucket go up.</p>
      <p>Split the five buckets into two families, and the whole system collapses into one sentence:</p>
      <div class="ledger-frame">
        <div class="ledger-title">Which side increases the balance?</div>
        <table class="ledger-table">
          <thead><tr><th>Bucket</th><th>Grows on the</th><th>Shrinks on the</th></tr></thead>
          <tbody>
            <tr><td>Asset <span class="acct-code">— cash, bank, MoMo, receivables, equipment</span></td><td><strong>Debit</strong> (left)</td><td>Credit (right)</td></tr>
            <tr><td>Expense <span class="acct-code">— rent, salaries, materials</span></td><td><strong>Debit</strong> (left)</td><td>Credit (right)</td></tr>
            <tr><td>Liability <span class="acct-code">— payables, loans</span></td><td><strong>Credit</strong> (right)</td><td>Debit (left)</td></tr>
            <tr><td>Equity <span class="acct-code">— owner's capital, retained earnings</span></td><td><strong>Credit</strong> (right)</td><td>Debit (left)</td></tr>
            <tr><td>Income <span class="acct-code">— product sales, service income</span></td><td><strong>Credit</strong> (right)</td><td>Debit (left)</td></tr>
          </tbody>
        </table>
      </div>
      <p>And every single entry in the system, no matter how it was created, must have <strong>total debits equal to total credits</strong>. The app enforces this — it will not let a lopsided entry be saved. That's the mechanical safety net sitting underneath everything you're about to learn.</p>
      <h3>Worked example: a GH₵500 T-shirt order, paid in cash</h3>
      <p>A customer pays GH₵500 cash for custom T-shirts. Cash (an asset) goes <em>up</em> — that's a debit. Product Sales (income) goes <em>up</em> — that's a credit.</p>
      <div class="ledger-frame">
        <div class="ledger-title">Journal Entry &middot; TXN-000041 &middot; 05 Sep 2026</div>
        <table class="ledger-table">
          <thead><tr><th>Account</th><th class="num">Debit</th><th class="num">Credit</th></tr></thead>
          <tbody>
            <tr><td><span class="acct-code">1011</span>Main Cash</td><td class="num">500.00</td><td class="num">—</td></tr>
            <tr><td><span class="acct-code">4010</span>Product Sales</td><td class="num">—</td><td class="num">500.00</td></tr>
            <tr class="total"><td>Total</td><td class="num">500.00</td><td class="num">500.00</td></tr>
          </tbody>
        </table>
      </div>
      <p>You will almost never type "debit" or "credit" into the app yourself — when you record income or an expense on the Transactions screen, the system builds this pair for you. But once you can read this table, every other screen in the Finance module makes sense, because they're all just this same idea wearing a different outfit.</p>
    </section>

    <hr class="rule">

    <section class="chapter" id="chart">
      <div class="chapter-head"><span class="chapter-num">03</span><h2>Chart of Accounts</h2></div>
      <p>The <strong>Chart of Accounts</strong> is the full list of every bucket the business tracks, each with a code and a name — the shelving system everything else gets filed into. DPS starts with a sensible set already built:</p>
      <div class="ledger-frame">
        <div class="ledger-title">A few you'll see often</div>
        <table class="ledger-table">
          <tbody>
            <tr><td><span class="acct-code">1011</span>Main Cash</td><td><span class="acct-code">1021</span>GCB Business Account</td><td><span class="acct-code">1031</span>MTN MoMo</td></tr>
            <tr><td><span class="acct-code">1040</span>Accounts Receivable</td><td><span class="acct-code">2010</span>Accounts Payable</td><td><span class="acct-code">4010</span>Product Sales</td></tr>
            <tr><td><span class="acct-code">5110</span>Office Supplies</td><td><span class="acct-code">5150</span>Salaries</td><td><span class="acct-code">5240</span>Materials</td></tr>
          </tbody>
        </table>
      </div>
      <p>Codes follow a pattern on purpose: <strong>1000s</strong> are assets, <strong>2000s</strong> liabilities, <strong>3000s</strong> equity, <strong>4000s</strong> income, <strong>5000s</strong> expenses. If you're ever unsure what type an unfamiliar account is, its first digit tells you.</p>
      <h3>When would I add a new account?</h3>
      <p>Rarely — and only for a genuinely new kind of cost or income the existing list doesn't cover (a new bank account, a new income stream). You generally will <em>not</em> add accounts by hand for everyday categories: when you type a category like "Printing Services" while recording a transaction, the system finds or creates the matching account automatically.</p>
      <div class="stamp-box caution">
        <span class="stamp">Caution</span>
        <p>Type category names <strong>exactly the same way every time</strong>. "Materials" and "material" will become two different accounts, quietly splitting one expense across two lines on every report from then on. When in doubt, pick from an existing category rather than typing a new one.</p>
      </div>
    </section>

    <section class="chapter" id="transactions">
      <div class="chapter-head"><span class="chapter-num">04</span><h2>Recording money in &amp; out</h2></div>
      <p>The <strong>Transactions</strong> screen is where the vast majority of your everyday entries happen — a straightforward sale, a bill you paid on the spot, anything that isn't a multi-week credit arrangement (that's Receivables/Payables, chapters 06–07).</p>
      <p>Every entry needs five things:</p>
      <div class="screen-map">
        <div class="row"><span class="label">TYPE</span><span>Income or Expense.</span></div>
        <div class="row"><span class="label">CATEGORY</span><span>What kind — "Product Sales," "Rent," "Materials." This decides which bucket the other side of the entry lands in.</span></div>
        <div class="row"><span class="label">AMOUNT</span><span>The Cedi value.</span></div>
        <div class="row"><span class="label">FINANCIAL ACCOUNT</span><span>Which real pot of money moved — Main Cash, GCB Business Account, or MTN MoMo. This must be an actual cash/bank/mobile-money account.</span></div>
        <div class="row"><span class="label">DATE</span><span>When it actually happened — not necessarily today.</span></div>
      </div>
      <p>Behind the scenes the system posts the two-sided entry for you, exactly like the T-shirt example in Chapter 02. You never have to think in debits and credits here — just answer the five questions honestly.</p>
      <div class="stamp-box">
        <span class="stamp">The system protects you</span>
        <p>If an expense would empty an account below zero — spending more Main Cash than is actually in the drawer — the app refuses to save it and tells you exactly by how much you'd be overdrawn. That's not a bug to work around; it's your first warning that either the amount, the date, or the account is wrong.</p>
      </div>
      <h3>Editing or deleting a mistake</h3>
      <p>Correct the entry as normal — but understand what actually happens underneath. The old entry is never erased. The system writes a <strong>reversal</strong> (a mirror-image entry that cancels it out) and then records your correction fresh. Both the mistake and the fix stay visible forever in the General Ledger (Chapter 08).</p>
      <p>This isn't extra bureaucracy for its own sake — it's precisely what an auditor expects to see: a complete, honest trail, including the corrections, rather than history that quietly rewrites itself.</p>
    </section>

    <section class="chapter" id="cashbank">
      <div class="chapter-head"><span class="chapter-num">05</span><h2>Cash &amp; Bank</h2></div>
      <p>This screen lists your real-world pots of money side by side — Main Cash, GCB Business Account, MTN MoMo — each with its running balance, and it's also where you move money <em>between</em> them: banking the day's cash, or topping up the MoMo float from the bank.</p>
      <div class="stamp-box credit">
        <span class="stamp">Not income, not an expense</span>
        <p>Moving GH₵1,000 from Main Cash into GCB Business Account is a <strong>transfer</strong>, not a sale and not a cost — the money hasn't left the business, it's just sitting somewhere else now. Always use Cash &amp; Bank → Transfer for this, never the Transactions screen. Recording it as income or an expense would make your revenue or costs look wrong for no reason.</p>
      </div>
      <p>A transfer is blocked the same way an overdrawn expense is: you cannot move out more than is actually sitting in the source account.</p>
    </section>

    <section class="chapter" id="receivable">
      <div class="chapter-head"><span class="chapter-num">06</span><h2>When a customer owes you</h2></div>
      <p>Use <strong>Receivables</strong> instead of the plain Transactions screen whenever a customer doesn't pay on the spot — a corporate client who'll settle a printing job in 30 days, for example. It tracks the debt itself, not just the eventual payment.</p>
      <div class="flow-steps">
        <span class="step">Draft</span><span class="arrow">→</span><span class="step">Sent</span><span class="arrow">→</span><span class="step">Partially Paid</span><span class="arrow">→</span><span class="step">Paid</span>
      </div>
      <h3>Step by step</h3>
      <ol>
        <li><strong>Create as Draft.</strong> Pick the client, an income category, and list what you're billing for, line by line. A draft touches nothing in the ledger yet — it's safe to fix typos freely.</li>
        <li><strong>Send it.</strong> This is the moment the sale becomes real in the books: the system debits Accounts Receivable and credits your income account for the full invoice total, even though no cash has arrived.</li>
        <li><strong>Record payment(s)</strong> as money actually comes in — the full amount at once, or in parts. Each payment debits the cash/bank/MoMo account you deposited into and credits Accounts Receivable down.</li>
      </ol>
      <div class="ledger-frame">
        <div class="ledger-title">Worked example &middot; GH₵3,000 corporate order</div>
        <table class="ledger-table">
          <thead><tr><th>When</th><th>Account</th><th class="num">Debit</th><th class="num">Credit</th></tr></thead>
          <tbody>
            <tr><td rowspan="2">Invoice sent</td><td><span class="acct-code">1040</span>Accounts Receivable</td><td class="num">3,000.00</td><td class="num">—</td></tr>
            <tr><td><span class="acct-code">4010</span>Product Sales</td><td class="num">—</td><td class="num">3,000.00</td></tr>
            <tr><td rowspan="2">GH₵1,000 received</td><td><span class="acct-code">1011</span>Main Cash</td><td class="num">1,000.00</td><td class="num">—</td></tr>
            <tr><td><span class="acct-code">1040</span>Accounts Receivable</td><td class="num">—</td><td class="num">1,000.00</td></tr>
          </tbody>
        </table>
      </div>
      <p>Notice: Product Sales was already recorded in full the moment the invoice was sent — receiving payment later never touches income again, it only moves the debt into cash. That's why a customer paying late doesn't distort your Profit &amp; Loss report.</p>
      <p>If a client is <strong>greylisted</strong> in the CRM, the system won't let you invoice them at all — that flag exists for a reason, and Finance respects it.</p>
      <p><strong>Cancelling</strong> an invoice reverses its ledger entry cleanly — but only before any payment has been recorded. Once money has come in against it, cancelling is blocked; sort out a part-paid invoice by contacting whoever manages the account rather than trying to delete it.</p>
    </section>

    <section class="chapter" id="payable">
      <div class="chapter-head"><span class="chapter-num">07</span><h2>When you owe a supplier</h2></div>
      <p><strong>Payables</strong> is the mirror image of Receivables, for money going the other way — a fabric supplier who invoices you and expects payment in two weeks.</p>
      <div class="flow-steps">
        <span class="step">Draft</span><span class="arrow">→</span><span class="step">Submitted</span><span class="arrow">→</span><span class="step">Partially Paid</span><span class="arrow">→</span><span class="step">Paid</span>
      </div>
      <ol>
        <li><strong>Create as Draft</strong> with the supplier, an expense category, and the line items on their bill.</li>
        <li><strong>Submit it</strong> — the cost is recognised now (debited to the expense account) against a new liability, Accounts Payable, even before you've paid a pesewa.</li>
        <li><strong>Record payment(s)</strong> as you actually pay — each one debits Accounts Payable down and credits whichever cash/bank account the money left from.</li>
      </ol>
      <p>The same overdraft protection from Chapter 04 applies here: the system will not let you record a payment that would take a bank or cash account below zero.</p>
    </section>

    <section class="chapter" id="ledger">
      <div class="chapter-head"><span class="chapter-num">08</span><h2>The General Ledger</h2></div>
      <p>Every debit-and-credit pair created anywhere in the system — a quick transaction, an invoice being sent, a payment, a transfer, a correction — lands here, in date order, permanently. If the Chart of Accounts is the shelving, the <strong>General Ledger</strong> is the complete, unedited diary of everything that's ever been placed on it.</p>
      <p>You won't write directly into the Ledger — every other screen writes to it for you. What you'll use it for is <strong>looking things up</strong>: filter by date range or by a specific account (say, MTN MoMo) to see everything that moved through it, or open a single entry to see its full debit/credit breakdown.</p>
      <div class="stamp-box">
        <span class="stamp">Reading a reversed entry</span>
        <p>An entry that's been corrected shows a <strong>Reversed</strong> tag and links to the entry that cancelled it out; the correction itself carries a <strong>Reversal</strong> tag linking back. Neither disappears — that pairing <em>is</em> the audit trail.</p>
      </div>
    </section>

    <section class="chapter" id="assets">
      <div class="chapter-head"><span class="chapter-num">09</span><h2>Company property</h2></div>
      <p>Cash and money owed aren't the only things the business owns — there's also the physical equipment: the large-format printer, the delivery van, office furniture. The <strong>Asset Ledger</strong> tracks each item individually: what it cost, what it's worth now, and its history of value changes.</p>
      <p>When you add an asset, its full purchase cost is logged as an <strong>acquisition</strong>. From there you can record:</p>
      <div class="screen-map">
        <div class="row"><span class="label">DEPRECIATION</span><span>Normal loss of value over time — a printer is worth less after three years of daily use.</span></div>
        <div class="row"><span class="label">APPRECIATION</span><span>Rare, but property or land can gain value.</span></div>
        <div class="row"><span class="label">MAINTENANCE</span><span>A logged repair cost — doesn't change the asset's value, just its history.</span></div>
        <div class="row"><span class="label">DISPOSAL</span><span>The item is sold, scrapped, or written off — its value drops to zero.</span></div>
      </div>
      <p>This ledger is separate from day-to-day Chart of Accounts postings — it's the detailed backup behind the "Equipment," "Vehicles," and "Buildings" totals, kept in one place for exactly the kind of question an auditor asks: "prove what this van is worth today, and show your work."</p>
    </section>

    <section class="chapter" id="reports">
      <div class="chapter-head"><span class="chapter-num">10</span><h2>Reading the reports</h2></div>
      <h3>Dashboard</h3>
      <p>Your morning glance. Cash, Bank, and Mobile Money balances; this month's income and expenses; Net Profit; and your most recent activity — all pulled live from everything you've recorded, no extra work required.</p>
      <h3>Profit &amp; Loss</h3>
      <p>Pick a date range, and it lists every income and expense account that had activity in that window, ending in one number: <strong>Net Profit</strong> (or loss). This is the report that answers "did we actually make money in August?"</p>
      <h3>Balance Sheet</h3>
      <p>A snapshot as of one specific date: everything owned (Assets), everything owed (Liabilities), and what's left for the owner (Equity). These three numbers must always balance —</p>
      <div class="ledger-frame">
        <div class="ledger-title">The one equation the whole system protects</div>
        <table class="ledger-table">
          <tbody><tr><td style="text-align:center; font-family:'IBM Plex Mono',monospace; font-size:16px; padding:18px;">Assets &nbsp;=&nbsp; Liabilities &nbsp;+&nbsp; Equity</td></tr></tbody>
        </table>
      </div>
      <p>— and because every entry in the system was forced to balance the moment it was created (Chapter 02), this equation is never something you have to manually reconcile. If it ever looked wrong, that would point to a real problem worth raising immediately, not a rounding error to shrug off.</p>
      <h3>Transaction Report</h3>
      <p>The export-ready, filterable list: a date range, a type, a category, a specific account. This is almost always what an auditor or the tax office actually wants handed to them.</p>
    </section>

    <hr class="rule">

    <section class="chapter" id="routine">
      <div class="chapter-head"><span class="chapter-num">11</span><h2>Your routine</h2></div>
      <p>Bookkeeping goes wrong less from difficulty and more from irregularity. A short routine, kept honestly, beats a perfect system used occasionally.</p>
      <div class="checklist-grid">
        <div class="checklist-card">
          <h4>Daily</h4>
          <ul>
            <li>Record each sale and cash expense the same day, while the details are fresh</li>
            <li>Bank or note any large cash received</li>
          </ul>
        </div>
        <div class="checklist-card">
          <h4>Weekly</h4>
          <ul>
            <li>Check Cash &amp; Bank balances match what's physically in the drawer / bank app</li>
            <li>Send any invoices sitting in Draft</li>
            <li>Chase anything showing as overdue in Receivables</li>
          </ul>
        </div>
        <div class="checklist-card">
          <h4>Monthly</h4>
          <ul>
            <li>Read the Profit &amp; Loss for the month just closed</li>
            <li>Check the Balance Sheet balances</li>
            <li>Pay any Payables coming due</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="chapter" id="mistakes">
      <div class="chapter-head"><span class="chapter-num">12</span><h2>Field guide to mistakes</h2></div>
      <div class="mistake">
        <span class="no">1</span>
        <div>
          <h4>Recording a transfer as income or an expense</h4>
          <p>Moving cash into the bank isn't a sale, and it isn't a cost.</p>
          <p class="fix">Use Cash &amp; Bank → Transfer for any movement between your own accounts.</p>
        </div>
      </div>
      <div class="mistake">
        <span class="no">2</span>
        <div>
          <h4>Typing a slightly different category name each time</h4>
          <p>"Materials," "material," and "Material Costs" become three separate accounts, quietly splitting one real expense on every report.</p>
          <p class="fix">Reuse an existing category from the list rather than free-typing a new one.</p>
        </div>
      </div>
      <div class="mistake">
        <span class="no">3</span>
        <div>
          <h4>Waiting until month-end to record everything from memory</h4>
          <p>Dates, amounts, and categories all get fuzzier by the day — and a backlog is exactly when mistakes hide.</p>
          <p class="fix">Record same-day. It takes under a minute per entry when it's fresh.</p>
        </div>
      </div>
      <div class="mistake">
        <span class="no">4</span>
        <div>
          <h4>Recording a big credit sale as a normal Transaction</h4>
          <p>The plain Transactions screen assumes cash changed hands immediately — it has no way to track what a customer still owes you.</p>
          <p class="fix">Anything paid later goes through Receivables, so the debt itself is tracked, not just the eventual payment.</p>
        </div>
      </div>
      <div class="mistake">
        <span class="no">5</span>
        <div>
          <h4>Treating an "overdrawn" warning as an obstacle to work around</h4>
          <p>The system is telling you the numbers don't add up to real money in that account.</p>
          <p class="fix">Stop and check the date, the amount, and the account before doing anything else — that warning is usually right.</p>
        </div>
      </div>
    </section>

    <section class="chapter" id="cheatsheet">
      <div class="chapter-head"><span class="chapter-num">13</span><h2>Cheat sheet</h2></div>
      <table class="cheat-table">
        <thead><tr><th>I need to…</th><th>Go to</th><th>What happens</th></tr></thead>
        <tbody>
          <tr><td>Record a cash sale</td><td class="where">Transactions</td><td>Income entry, posts immediately</td></tr>
          <tr><td>Record an expense I paid today</td><td class="where">Transactions</td><td>Expense entry, posts immediately</td></tr>
          <tr><td>Move cash into the bank</td><td class="where">Cash &amp; Bank</td><td>Transfer, not income/expense</td></tr>
          <tr><td>Bill a client who'll pay later</td><td class="where">Receivables</td><td>Draft, then Send when ready</td></tr>
          <tr><td>Record a customer's payment</td><td class="where">Receivables → Invoice</td><td>Reduces their balance owed</td></tr>
          <tr><td>Log a supplier's bill</td><td class="where">Payables</td><td>Draft, then Submit when confirmed</td></tr>
          <tr><td>Pay a supplier</td><td class="where">Payables → Bill</td><td>Reduces what you owe them</td></tr>
          <tr><td>Add a vehicle or piece of equipment</td><td class="where">Asset Ledger</td><td>Logs it at purchase cost</td></tr>
          <tr><td>Check if we're profitable this month</td><td class="where">Reports → Profit &amp; Loss</td><td>Net profit for a date range</td></tr>
          <tr><td>See everything for an audit</td><td class="where">Reports → Transaction Report</td><td>Filterable, exportable list</td></tr>
          <tr><td>Fix a wrong amount</td><td class="where">Transactions → Edit</td><td>Old entry reversed, new one posted</td></tr>
        </tbody>
      </table>
    </section>

    <section class="chapter" id="glossary">
      <div class="chapter-head"><span class="chapter-num">14</span><h2>Glossary</h2></div>
      <dl class="glossary">
        <div><dt>Account</dt><dd>One named bucket in the Chart of Accounts — e.g. "Main Cash" or "Rent."</dd></div>
        <div><dt>Chart of Accounts</dt><dd>The full list of every account the business tracks.</dd></div>
        <div><dt>Debit / Credit</dt><dd>The two sides of every entry. Neither is inherently good or bad — see Chapter 02.</dd></div>
        <div><dt>Journal Entry</dt><dd>One complete, balanced debit-and-credit record of a single event.</dd></div>
        <div><dt>General Ledger</dt><dd>The permanent, date-ordered record of every journal entry ever posted.</dd></div>
        <div><dt>Reversal</dt><dd>A mirror-image entry that cancels out an earlier one, used instead of deleting history.</dd></div>
        <div><dt>Receivable</dt><dd>Money a customer owes the business.</dd></div>
        <div><dt>Payable</dt><dd>Money the business owes a supplier.</dd></div>
        <div><dt>Opening Balance</dt><dd>The starting value given to an account when it's first set up in the system.</dd></div>
        <div><dt>Net Profit</dt><dd>Total income minus total expenses for a chosen period.</dd></div>
        <div><dt>Balance Sheet</dt><dd>A snapshot as of one date: Assets = Liabilities + Equity.</dd></div>
        <div><dt>Overdraft protection</dt><dd>The system's refusal to let a cash/bank account go below zero.</dd></div>
      </dl>
    </section>

    <footer class="colophon">
      <p>Written for DPS's Finance module. When a screen doesn't match this manual, trust the screen and flag the difference — software changes faster than paper.</p>
    </footer>
  </main>
</div>

<button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>

<script>
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('nav.toc a'));
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);

    function setActive() {
      var y = window.scrollY + 120;
      var current = sections[0];
      sections.forEach(function (sec) { if (sec.offsetTop <= y) current = sec; });
      links.forEach(function (a) {
        var match = a.getAttribute('href') === '#' + current.id;
        a.classList.toggle('active', match);
      });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { setActive(); ticking = false; });
        ticking = true;
      }
      var btn = document.getElementById('backToTop');
      btn.classList.toggle('show', window.scrollY > 600);
    });

    setActive();

    document.getElementById('backToTop').addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();
</script>
</body>
</html>
