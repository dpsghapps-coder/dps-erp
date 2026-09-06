<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ $article['title'] }} &middot; Help Center</title>
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
  .wrap { max-width: 880px; margin: 0 auto; padding: 40px 24px 100px; }
  .back-link { display:inline-flex; align-items:center; gap:6px; font-size:13.5px; color:var(--ink-faint); text-decoration:none; margin-bottom:22px; }
  .back-link:hover { color:var(--accent); }
  .art-head { max-width: 640px; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid var(--ink); }
  .art-head .eyebrow { font-family:"IBM Plex Mono",monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent); margin:0 0 12px; }
  .art-head h1 { font-size: clamp(28px,3.6vw,38px); font-weight:600; margin:0 0 12px; line-height:1.12; }
  .art-head p { font-size:16.5px; color:var(--ink-soft); margin:0; }

  .shot-block { margin-bottom: 52px; }
  .shot-caption { font-family:"Fraunces",serif; font-weight:600; font-size:16px; margin:0 0 12px; }
  .shot-frame {
    border:1px solid var(--paper-line); border-radius:8px; overflow:hidden; box-shadow:var(--shadow);
    margin-bottom: 20px; background:var(--card);
  }
  .shot-frame img { display:block; width:100%; height:auto; }

  .legend { display:flex; flex-direction:column; gap:14px; }
  .legend-item { display:flex; gap:14px; align-items:flex-start; }
  .legend-num {
    flex-shrink:0; width:26px; height:26px; border-radius:50%; background:var(--accent); color:#fff;
    font:700 13px/26px "Segoe UI",sans-serif; text-align:center;
  }
  .legend-item h4 { margin:0 0 3px; font-size:15px; font-weight:600; }
  .legend-item p { margin:0; font-size:14.5px; color:var(--ink-soft); }

  .tips-box {
    background:var(--card); border:1.5px solid var(--paper-line); border-left:4px solid var(--accent);
    border-radius:6px; padding:18px 22px; margin-top:12px; box-shadow:var(--shadow);
  }
  .tips-box .stamp { display:block; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--accent); margin-bottom:10px; }
  .tips-box ul { margin:0; padding-left:1.2em; }
  .tips-box li { margin-bottom:8px; font-size:15px; color:var(--ink-soft); }
  .tips-box li:last-child { margin-bottom:0; }
</style>
</head>
<body>
<div class="wrap">
  <a class="back-link" href="{{ url('/help') }}">&larr; Back to Help Center</a>

  <div class="art-head">
    <p class="eyebrow">{{ $article['module'] }}</p>
    <h1>{{ $article['title'] }}</h1>
    <p>{{ $article['summary'] }}</p>
  </div>

  @foreach ($article['screenshots'] as $shot)
    <div class="shot-block">
      <p class="shot-caption">{{ $shot['caption'] }}</p>
      <div class="shot-frame">
        <img src="{{ asset('images/help/'.$shot['image']) }}" alt="{{ $shot['caption'] }}">
      </div>
      <div class="legend">
        @foreach ($shot['callouts'] as $c)
          <div class="legend-item">
            <span class="legend-num">{{ $c['n'] }}</span>
            <div>
              <h4>{{ $c['title'] }}</h4>
              <p>{{ $c['text'] }}</p>
            </div>
          </div>
        @endforeach
      </div>
    </div>
  @endforeach

  @if (!empty($article['tips']))
    <div class="tips-box">
      <span class="stamp">Worth knowing</span>
      <ul>
        @foreach ($article['tips'] as $tip)
          <li>{{ $tip }}</li>
        @endforeach
      </ul>
    </div>
  @endif
</div>
</body>
</html>
