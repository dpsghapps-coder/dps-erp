<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Help Center</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Serif+4:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
  :root {
    --paper: #f4f7f1;
    --paper-alt: #e9efe4;
    --paper-line: #cddac6;
    --ink: #1e2a22;
    --ink-soft: #4b5a4f;
    --ink-faint: #7c8b7f;
    --accent: #7c3aed;
    --accent-soft: #ede4fb;
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
      --accent: #b795f5;
      --accent-soft: #2c2145;
      --card: #182219;
      --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.35);
    }
  }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--paper); color:var(--ink); font-family:"Source Serif 4",Georgia,serif; font-size:16.5px; line-height:1.6; }
  h1,h2,h3,.eyebrow { font-family:"Fraunces",Georgia,serif; }
  code,.mono { font-family:"IBM Plex Mono",monospace; }
  a { color:var(--accent); }
  .wrap { max-width: 980px; margin: 0 auto; padding: 56px 24px 100px; }
  .masthead { max-width: 640px; margin-bottom: 48px; padding-bottom: 28px; border-bottom: 2px solid var(--ink); }
  .masthead .eyebrow { font-family:"IBM Plex Mono",monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent); margin:0 0 12px; }
  .masthead h1 { font-size: clamp(30px,4vw,42px); font-weight:600; margin:0 0 14px; line-height:1.1; }
  .masthead p { font-size:17px; color:var(--ink-soft); margin:0 0 8px; max-width:58ch; }
  .fieldmanual-banner {
    display:flex; align-items:center; justify-content:space-between; gap:20px;
    background:var(--card); border:1px solid var(--paper-line); border-left:4px solid var(--accent);
    border-radius:8px; padding:18px 22px; margin-bottom:48px; box-shadow:var(--shadow);
  }
  .fieldmanual-banner .txt strong { display:block; font-family:"Fraunces",serif; font-size:16px; margin-bottom:2px; }
  .fieldmanual-banner .txt span { font-size:14px; color:var(--ink-soft); }
  .fieldmanual-banner a.btn {
    background:var(--accent); color:#fff; text-decoration:none; padding:9px 18px; border-radius:6px;
    font-size:14px; font-weight:600; white-space:nowrap;
  }
  .module-group { margin-bottom: 44px; }
  .module-group h2 {
    font-size:12px; letter-spacing:0.1em; text-transform:uppercase; color:var(--ink-faint);
    font-family:"IBM Plex Mono",monospace; font-weight:600; margin:0 0 16px;
    padding-bottom:10px; border-bottom:1px solid var(--paper-line);
  }
  .article-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:18px; }
  .article-card {
    display:block; background:var(--card); border:1px solid var(--paper-line); border-radius:8px;
    padding:20px; text-decoration:none; color:var(--ink); box-shadow:var(--shadow);
    transition: transform .12s ease, box-shadow .12s ease;
  }
  .article-card:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(30,42,34,0.1), 0 12px 28px rgba(30,42,34,0.08); }
  .article-card h3 { font-size:18px; margin:0 0 8px; font-weight:600; }
  .article-card p { font-size:14.5px; color:var(--ink-soft); margin:0 0 12px; }
  .article-card .go { font-size:13px; font-weight:600; color:var(--accent); }
  .empty-note { font-size:14px; color:var(--ink-faint); font-style:italic; }
</style>
</head>
<body>
<div class="wrap">
  <div class="masthead">
    <p class="eyebrow">DPS-ERP &middot; Screen-by-screen reference</p>
    <h1>Help Center</h1>
    <p>Annotated screenshots of the actual screens in this app — what every button does, in plain language. Pick a page below.</p>
  </div>

  <div class="fieldmanual-banner">
    <div class="txt">
      <strong>New to bookkeeping?</strong>
      <span>The Field Manual teaches the concepts behind Finance from scratch — no accounting background needed.</span>
    </div>
    <a class="btn" href="{{ url('/finance/help') }}" target="_blank" rel="noopener noreferrer">Read the Field Manual</a>
  </div>

  @foreach ($articles->groupBy('module') as $module => $group)
    <div class="module-group">
      <h2>{{ $module }}</h2>
      <div class="article-grid">
        @foreach ($group as $article)
          <a class="article-card" href="{{ url('/help/'.$article['slug']) }}">
            <h3>{{ $article['title'] }}</h3>
            <p>{{ $article['summary'] }}</p>
            <span class="go">View guide &rarr;</span>
          </a>
        @endforeach
      </div>
    </div>
  @endforeach
</div>
</body>
</html>
