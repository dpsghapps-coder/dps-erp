import{b as d,j as r,H as g,L as p}from"./app-F-kfucpK.js";import{A as m,b as f,N as x}from"./AppLayout-rzZ7HF96.js";import{P as u,G as c,E as b}from"./index_original-IudFlhkA.js";/* empty css            */import"./createLucideIcon-QCrmQrkn.js";import"./users-Y0gW8cgI.js";import"./x-DB4hbpDX.js";import"./arrow-left-CuCQzy_x.js";import"./shopping-cart-Ddifhkb4.js";import"./clock-DXpW1P7u.js";function v(e){const a=new Map;e.forEach(t=>a.set(t.id,{...t,children:[]}));const o=[];a.forEach(t=>{const i=t.supervising_manager_id,s=i!=null?a.get(i):void 0;s&&s.id!==t.id?s.children.push(t):o.push(t)});const n=(t,i)=>`${t.first_name} ${t.last_name}`.localeCompare(`${i.first_name} ${i.last_name}`),l=t=>{t.sort(n),t.forEach(i=>l(i.children))};return l(o),o}function j(e,a){return`${e?.charAt(0)||""}${a?.charAt(0)||""}`.toUpperCase()}function y({node:e,highlighted:a}){return r.jsxs(p,{href:`/hrm/employees/${e.id}`,className:`org-node-card ${a?"org-node-highlighted":""}`,children:[r.jsx("div",{className:"org-node-avatar",children:e.avatar?r.jsx("img",{src:`/storage/${e.avatar}`,alt:`${e.first_name} ${e.last_name}`}):r.jsx("span",{children:j(e.first_name,e.last_name)})}),r.jsxs("div",{className:"org-node-name",children:[e.first_name," ",e.last_name]}),e.job_title&&r.jsx("div",{className:"org-node-title",children:e.job_title}),e.department?.name&&r.jsx("div",{className:"org-node-dept",children:e.department.name})]})}function h({node:e,highlightId:a}){return r.jsxs("li",{children:[r.jsx(y,{node:e,highlighted:e.id===a}),e.children.length>0&&r.jsx("ul",{children:e.children.map(o=>r.jsx(h,{node:o,highlightId:a},o.id))})]})}function O({employees:e}){const[a,o]=d.useState(""),n=d.useMemo(()=>v(e),[e]),l=d.useMemo(()=>{if(!a.trim())return null;const t=a.trim().toLowerCase();return e.find(s=>`${s.first_name} ${s.last_name}`.toLowerCase().includes(t))?.id??null},[a,e]);return r.jsxs(m,{children:[r.jsx(g,{title:"Organization Chart"}),r.jsx("style",{children:`
                .org-chart-scroll { overflow-x: auto; padding: 8px 4px 32px; }
                .org-chart-forest { display: flex; gap: 48px; justify-content: center; min-width: max-content; }
                .org-chart-tree, .org-chart-tree ul { list-style: none; margin: 0; padding: 0; }
                .org-chart-tree { display: flex; text-align: center; }
                .org-chart-tree ul { display: flex; padding-top: 28px; position: relative; }
                .org-chart-tree li { position: relative; padding: 28px 10px 0 10px; display: flex; flex-direction: column; align-items: center; }
                .org-chart-tree li::before, .org-chart-tree li::after {
                    content: ''; position: absolute; top: 0; right: 50%;
                    border-top: 2px solid var(--org-line, #cbd5e1); width: 50%; height: 28px;
                }
                .org-chart-tree li::after { right: auto; left: 50%; border-left: 2px solid var(--org-line, #cbd5e1); }
                .org-chart-tree li:only-child::before, .org-chart-tree li:only-child::after { display: none; }
                .org-chart-tree li:only-child { padding-top: 0; }
                .org-chart-tree li:first-child::before, .org-chart-tree li:last-child::after { border: 0 none; }
                .org-chart-tree li:last-child::before { border-right: 2px solid var(--org-line, #cbd5e1); border-radius: 0 6px 0 0; }
                .org-chart-tree li:first-child::after { border-radius: 6px 0 0 0; }
                .org-chart-tree ul ul::before {
                    content: ''; position: absolute; top: 0; left: 50%;
                    border-left: 2px solid var(--org-line, #cbd5e1); width: 0; height: 28px;
                }
                :root:not([data-theme="light"]) .org-chart-tree { --org-line: #cbd5e1; }
                @media (prefers-color-scheme: dark) {
                    :root:not([data-theme="light"]) .org-chart-tree { --org-line: #475569; }
                }
                :root[data-theme="dark"] .org-chart-tree { --org-line: #475569; }

                .org-node-card {
                    display: flex; flex-direction: column; align-items: center; gap: 2px;
                    width: 140px; padding: 12px 10px; border-radius: 12px;
                    background: var(--org-card-bg, #fff); border: 1px solid var(--org-card-border, #e2e8f0);
                    text-decoration: none; transition: box-shadow .15s, border-color .15s;
                }
                .org-node-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.08); border-color: #818cf8; }
                .org-node-highlighted { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.25); }
                :root:not([data-theme="light"]) .org-node-card { --org-card-bg: #fff; --org-card-border: #e2e8f0; }
                @media (prefers-color-scheme: dark) {
                    :root:not([data-theme="light"]) .org-node-card { --org-card-bg: #1e293b; --org-card-border: rgba(255,255,255,0.1); }
                }
                :root[data-theme="dark"] .org-node-card { --org-card-bg: #1e293b; --org-card-border: rgba(255,255,255,0.1); }

                .org-node-avatar {
                    width: 48px; height: 48px; border-radius: 9999px; overflow: hidden;
                    background: #eef2ff; color: #4338ca; display: flex; align-items: center; justify-content: center;
                    font-weight: 600; font-size: 14px; flex-shrink: 0;
                }
                .org-node-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .org-node-name { font-size: 13px; font-weight: 600; color: var(--org-text, #0f172a); line-height: 1.2; }
                .org-node-title { font-size: 11px; color: #94a3b8; line-height: 1.2; }
                .org-node-dept { font-size: 11px; color: #6366f1; line-height: 1.2; }
                :root:not([data-theme="light"]) .org-node-name { --org-text: #0f172a; }
                @media (prefers-color-scheme: dark) {
                    :root:not([data-theme="light"]) .org-node-name { --org-text: #f1f5f9; }
                }
                :root[data-theme="dark"] .org-node-name { --org-text: #f1f5f9; }
            `}),r.jsx(u,{title:"Organization Chart",subtitle:"Reporting structure across the company, based on each employee's supervising manager"}),r.jsx(c,{className:"mb-6",children:r.jsxs("div",{className:"relative max-w-sm",children:[r.jsx(f,{className:"w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"}),r.jsx("input",{type:"text",className:"glass-input w-full pl-9",placeholder:"Find an employee...",value:a,onChange:t=>o(t.target.value)})]})}),n.length===0?r.jsx(b,{icon:x,title:"No employees to chart",description:"Once employees are added and linked to a supervising manager, the reporting structure will appear here."}):r.jsx(c,{children:r.jsx("div",{className:"org-chart-scroll",children:r.jsx("div",{className:"org-chart-forest",children:n.map(t=>r.jsx("ul",{className:"org-chart-tree",children:r.jsx(h,{node:t,highlightId:l})},t.id))})})})]})}export{O as default};
