/*
 * Pronomic site menu: header, mega menus, in-menu lifting guide, search
 * and mobile drawer.
 *
 * Usage:
 *   <div id="pronomic-menu"></div>
 *   <script src="advisor-config.js"></script>   // for the in-menu guide
 *   <script src="advisor.js"></script>          // recommendation engine + icons
 *   <script src="menu-config.js"></script>
 *   <script src="menu.js"></script>
 *   <script>PronomicMenu.mount("#pronomic-menu");</script>
 *
 * Without the advisor scripts the menu still works: the guide then sends the
 * visitor to the Lifting Advisor page after the first answer.
 */
(function (root) {
  "use strict";

  // ---------------------------------------------------------------------------
  // Pure helpers (no DOM) — covered by menu.test.js
  // ---------------------------------------------------------------------------

  /** URL of the Lifting Advisor with the answers given so far. */
  function handoffUrl(advisorUrl, answers) {
    const base = root.location ? root.location.href : "https://example.com/";
    const url = new URL(advisorUrl, base);
    for (const k in answers || {}) {
      const v = answers[k];
      if (v == null || (Array.isArray(v) && !v.length)) continue;
      url.searchParams.set(k, [].concat(v).join(","));
    }
    return url.toString();
  }

  /** Every link in the menu, flattened, for instant search. */
  function buildSearchIndex(config) {
    const seen = new Set();
    const out = [];
    function add(link, section) {
      if (link && link.tailor && !link.url) link = Object.assign({}, link, { url: (config.contact && config.contact.url) || "#" });
      if (!link || !link.url || seen.has(link.label + link.url)) return;
      seen.add(link.label + link.url);
      out.push({ label: link.label, detail: link.detail || "", url: link.url, section, icon: link.icon });
    }
    for (const item of config.items) {
      for (const g of item.groups || []) for (const l of g.links) add(l, item.label);
      for (const l of item.links || []) add(l, item.label);
      for (const l of item.footer || []) add(l, item.label);
      if (item.examples) for (const l of item.examples.links) add(l, item.label);
      if (item.feature && item.feature.link) add({ label: item.feature.title, url: item.feature.link.url }, item.label);
    }
    for (const l of config.utility || []) add(l, "Quick links");
    if (config.login) for (const l of config.login.links) add(l, "Log in");
    return out;
  }

  function normalize(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[&+]/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
  }

  /** Links whose label or detail contains every word typed. Label hits first. */
  function searchLinks(index, query, limit) {
    const words = normalize(query).split(" ").filter(Boolean);
    if (!words.length) return [];
    return index
      .map((l) => {
        const label = normalize(l.label);
        const all = label + " " + normalize(l.detail) + " " + normalize(l.section);
        if (!words.every((w) => all.includes(w))) return null;
        let score = 0;
        for (const w of words) {
          if (label.startsWith(w)) score += 3;
          else if (label.split(" ").some((t) => t.startsWith(w))) score += 2;
          else if (label.includes(w)) score += 1;
        }
        return { link: l, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit || 6)
      .map((r) => r.link);
  }

  // ---------------------------------------------------------------------------
  // DOM helpers
  // ---------------------------------------------------------------------------

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (k === "class") node.className = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else if (v != null && v !== false) node.setAttribute(k, v === true ? "" : v);
    }
    for (const c of [].concat(children || []).flat(Infinity)) {
      if (c == null || c === false) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  const UI_ICONS = {
    chevron: "M6 9l6 6 6-6",
    arrow: "M5 12h14M13 6l6 6-6 6",
    search: "M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM20 20l-4-4",
    menu: "M4 7h16M4 12h16M4 17h16",
    close: "M6 6l12 12M18 6L6 18",
    user: "M12 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM4 20c1.5-4 4.5-6 8-6s6.5 2 8 6",
    globe: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
    check: "M5 12l5 5 9-10",
    back: "M19 12H5M11 6l-6 6 6 6",
    compass: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM15.5 8.5l-2 5-5 2 2-5z",
    tool: "M14 6a4 4 0 0 0 5 5l-8 8a2 2 0 0 1-3-3l8-8a4 4 0 0 0-2-2zM14 6l2-2",
    chat: "M4 5h16v11H9l-5 4z",
  };

  function uiIcon(name, cls) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "pm-ui-icon " + (cls || ""));
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", UI_ICONS[name]);
    svg.appendChild(p);
    return svg;
  }

  /** Product/load line icons shared with the Lifting Advisor (48×48). */
  function lineIcon(name, cls) {
    const icons = root.PronomicAdvisor && root.PronomicAdvisor.icons;
    if (!name || !icons || !icons[name]) return null;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 48 48");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "pm-line-icon " + (cls || ""));
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", icons[name]);
    svg.appendChild(p);
    return svg;
  }

  /** Icon on a rounded green tile (product and load links). */
  function iconTile(name) {
    if (!name) return null;
    const svg = UI_ICONS[name] ? uiIcon(name) : lineIcon(name);
    return svg ? el("span", { class: "pm-tile", "aria-hidden": "true" }, svg) : null;
  }

  // ---------------------------------------------------------------------------
  // Mount
  // ---------------------------------------------------------------------------

  function mount(target, config, advisorConfig) {
    config = config || root.PRONOMIC_MENU_CONFIG;
    advisorConfig = advisorConfig || root.PRONOMIC_ADVISOR_CONFIG || null;
    const host = typeof target === "string" ? document.querySelector(target) : target;
    if (!host) throw new Error("PronomicMenu: mount target not found");

    const engine = root.PronomicAdvisor && advisorConfig ? root.PronomicAdvisor : null;
    const searchIndex = buildSearchIndex(config);
    const guideItem = config.items.find((i) => i.type === "guide");
    const contactUrl = (config.contact && config.contact.url) || "#";
    let uid = 0;
    const id = (p) => "pm-" + p + "-" + ++uid;

    // ---- Analytics -------------------------------------------------------
    function track(name, detail) {
      detail = detail || {};
      host.dispatchEvent(new CustomEvent("menu:" + name, { detail, bubbles: true }));
      if (root.dataLayer) root.dataLayer.push(Object.assign({ event: "site_menu_" + name }, detail));
    }
    // One listener for every link click in the menu.
    host.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || !host.contains(a)) return;
      track("click", {
        menu_section: a.closest("[data-section]") ? a.closest("[data-section]").getAttribute("data-section") : "",
        link_text: a.getAttribute("data-label") || a.textContent.trim().slice(0, 80),
        link_url: a.href,
      });
    });

    function link(l, cls, children) {
      const href = l.advisor ? config.advisorUrl : l.tailor ? withTopic(contactUrl, "tailor-made") : l.url;
      return el("a", { class: cls, href, "data-label": l.label }, children);
    }

    function withTopic(url, topic) {
      const u = new URL(url, root.location.href);
      if (topic) u.searchParams.set("topic", topic);
      return u.toString();
    }

    // ---- In-menu lifting guide (shared state, rendered in desktop panel and drawer)
    const guideQuestions = guideItem && advisorConfig
      ? guideItem.questions.map((qid) => advisorConfig.questions.find((q) => q.id === qid)).filter(Boolean)
      : [];
    const guide = { step: 0, answers: {} };
    const guideViews = [];

    function guideSet(q, value) {
      guide.answers[q.id] = value;
      track("guide_answer", { question: q.id, answer: value, step: guide.step + 1 });
      guide.step += 1;
      if (guide.step >= guideQuestions.length) {
        const top = engine ? engine.recommend(guide.answers, advisorConfig).results[0] : null;
        track("guide_result", { answers: Object.assign({}, guide.answers), solution: top ? top.product.id : "none" });
      }
      renderGuides(true);
    }
    function guideBack() { guide.step = Math.max(0, guide.step - 1); delete guide.answers[guideQuestions[guide.step].id]; renderGuides(true); }
    function guideReset() { guide.step = 0; guide.answers = {}; renderGuides(true); }

    function renderGuide(view) {
      const total = guideQuestions.length;
      const done = guide.step >= total;
      const steps = el("ol", { class: "pm-guide-steps", "aria-label": "Progress" },
        (guideItem.steps || []).map((s, i) =>
          el("li", { class: i < guide.step ? "is-done" : i === guide.step ? "is-current" : "", "aria-current": i === guide.step ? "step" : null }, [
            el("span", { class: "pm-guide-dot" }, i < guide.step ? uiIcon("check") : String(i + 1)),
            el("span", null, s),
          ])
        )
      );

      let body;
      if (!guideQuestions.length) {
        // Advisor scripts not on the page: go straight to the advisor.
        body = el("p", null, [el("a", { class: "pm-btn pm-btn--primary", href: config.advisorUrl }, ["Start the Lifting Advisor", uiIcon("arrow")])]);
      } else if (!done) {
        const q = guideQuestions[guide.step];
        const kind = q.id === "load" ? "tiles" : q.id === "weight" ? "chips" : "rows";
        body = el("div", { class: "pm-guide-q" }, [
          el("p", { class: "pm-guide-title", tabindex: "-1" }, q.title),
          el("div", { class: "pm-guide-options pm-guide-options--" + kind, role: "group", "aria-label": q.title },
            q.options.map((o) =>
              el("button", { type: "button", class: "pm-guide-option", onclick: () => guideSet(q, o.value) }, [
                kind === "tiles" ? lineIcon(o.icon, "pm-guide-icon") : null,
                el("span", { class: "pm-guide-option-label" }, o.label),
                kind === "rows" && o.hint ? el("span", { class: "pm-guide-option-hint" }, o.hint) : null,
              ])
            )
          ),
          guide.step > 0
            ? el("button", { type: "button", class: "pm-textbtn", onclick: guideBack }, [uiIcon("back"), "Back"])
            : null,
        ]);
      } else {
        body = renderGuideResult();
      }
      view.replaceChildren(steps, body);
    }

    function renderGuideResult() {
      const r = engine.recommend(guide.answers, advisorConfig).results[0];
      const more = advisorConfig.questions.length - guideQuestions.length;
      const advisorHref = handoffUrl(config.advisorUrl, guide.answers);
      if (!r) {
        return el("div", { class: "pm-guide-result" }, [
          el("p", { class: "pm-guide-title", tabindex: "-1" }, "This sounds like a job for a tailored solution"),
          el("p", { class: "pm-muted" }, "None of our standard solutions fits all your answers. Our application experts design solutions like this every day."),
          el("div", { class: "pm-guide-actions" }, [
            el("a", { class: "pm-btn pm-btn--primary", href: withTopic(contactUrl, "tailor-made") }, ["Describe your lift", uiIcon("arrow")]),
            el("button", { type: "button", class: "pm-textbtn", onclick: guideReset }, "Start again"),
          ]),
        ]);
      }
      const p = r.product;
      return el("div", { class: "pm-guide-result" }, [
        el("div", { class: "pm-guide-match" }, [
          el("div", { class: "pm-guide-match-visual" }, lineIcon(p.icon, "pm-guide-match-icon")),
          el("div", null, [
            el("p", { class: "pm-eyebrow" }, "A good place to start"),
            el("p", { class: "pm-guide-title", tabindex: "-1" }, p.name),
            el("p", { class: "pm-muted" }, p.summary),
          ]),
        ]),
        el("div", { class: "pm-guide-actions" }, [
          el("a", { class: "pm-btn pm-btn--primary", href: advisorHref, "data-label": "Guide: refine in advisor",
            onclick: () => track("guide_handoff", { answers: Object.assign({}, guide.answers), solution: p.id }) },
            [more > 0 ? `Refine with ${more} more questions` : "See the full advice", uiIcon("arrow")]),
          el("a", { class: "pm-btn pm-btn--ghost", href: p.url, "data-label": "Guide: " + p.name }, "See the products"),
        ]),
        el("p", { class: "pm-guide-foot" }, [
          "Special load or set-up? ",
          el("a", { href: withTopic(contactUrl, "tailor-made"), "data-label": "Guide: tailor-made" }, "We'll tailor it for you"),
          " · ",
          el("button", { type: "button", class: "pm-textbtn pm-textbtn--inline", onclick: guideReset }, "Start again"),
        ]),
      ]);
    }

    function renderGuides(focus) {
      for (const v of guideViews) {
        renderGuide(v);
        if (focus && v.offsetParent) {
          const t = v.querySelector(".pm-guide-title");
          if (t) t.focus({ preventScroll: true });
        }
      }
    }

    function guideView() {
      const v = el("div", { class: "pm-guide", "aria-live": "polite" });
      guideViews.push(v);
      renderGuide(v);
      return v;
    }

    // ---- Panel content -----------------------------------------------------
    function linkList(links, columns) {
      return el("ul", { class: "pm-links" + (columns === 2 ? " pm-links--2" : "") },
        links.map((l) =>
          el("li", null, link(l, "pm-link" + (l.tailor ? " pm-link--tailor" : ""), [
            iconTile(l.icon),
            el("span", { class: "pm-link-text" }, [
              el("span", { class: "pm-link-label" }, l.label),
              l.detail ? el("span", { class: "pm-link-detail" }, l.detail) : null,
            ]),
          ]))
        )
      );
    }

    function tailorCard(compact) {
      const t = config.items.find((i) => i.type === "tailor");
      if (!t) return null;
      return el("div", { class: "pm-card pm-card--tailor" }, [
        uiIcon("tool", "pm-card-icon"),
        el("p", { class: "pm-card-title" }, t.title),
        compact ? el("p", { class: "pm-card-text" }, "Standard products are the start. We adapt grippers, tools and set-up to your load.") : null,
        el("a", { class: "pm-card-link", href: withTopic(contactUrl, "tailor-made"), "data-label": "Tailor card: " + t.primary.label }, [t.primary.label, uiIcon("arrow")]),
      ]);
    }

    function renderGuidePanel(item) {
      return el("div", { class: "pm-panel-inner pm-panel-inner--guide" }, [
        el("div", { class: "pm-guide-wrap" }, [
          el("div", { class: "pm-panel-head" }, [
            el("p", { class: "pm-panel-title" }, [uiIcon("compass", "pm-title-icon"), item.title]),
            el("p", { class: "pm-muted" }, item.lede),
          ]),
          guideView(),
        ]),
        el("aside", { class: "pm-side" }, [
          el("p", { class: "pm-group-title" }, item.byNeed.title),
          el("ul", { class: "pm-needs" },
            item.byNeed.links.map((n) =>
              el("li", null, el("a", { class: "pm-need", href: handoffUrl(config.advisorUrl, { movement: n.movement }), "data-label": "Need: " + n.label }, [
                el("span", null, n.label), uiIcon("arrow"),
              ]))
            )
          ),
          tailorCard(true),
        ]),
      ]);
    }

    function renderMegaPanel(item) {
      return el("div", { class: "pm-panel-inner" + (item.feature ? " has-feature" : "") }, [
        el("div", { class: "pm-groups pm-groups--" + item.groups.length }, item.groups.map((g) =>
          el("div", { class: "pm-group" + (g.columns === 2 ? " pm-group--wide" : "") }, [
            el("p", { class: "pm-group-title" }, g.title),
            linkList(g.links, g.columns),
          ])
        )),
        item.feature ? el("aside", { class: "pm-side" }, [
          el("div", { class: "pm-card pm-card--feature" }, [
            el("p", { class: "pm-eyebrow pm-eyebrow--light" }, item.feature.eyebrow),
            el("p", { class: "pm-card-title" }, item.feature.title),
            el("p", { class: "pm-card-text" }, item.feature.text),
            el("a", { class: "pm-btn pm-btn--primary", href: item.feature.link.url, "data-label": item.feature.link.label,
              onclick: () => track("probldr_click", { from: item.id }) }, [item.feature.link.label, uiIcon("arrow")]),
          ]),
        ]) : null,
        item.footer ? el("div", { class: "pm-panel-foot" }, item.footer.map((l) => link(l, "pm-foot-link", [l.label, uiIcon("arrow")]))) : null,
      ]);
    }

    function renderTailorPanel(item) {
      return el("div", { class: "pm-panel-inner pm-panel-inner--tailor" }, [
        el("div", { class: "pm-tailor-main" }, [
          el("p", { class: "pm-panel-title" }, [uiIcon("tool", "pm-title-icon"), item.title]),
          el("p", { class: "pm-lede" }, item.lede),
          el("ol", { class: "pm-process" }, item.steps.map((s, i) =>
            el("li", null, [
              el("span", { class: "pm-process-num" }, String(i + 1)),
              el("span", { class: "pm-process-title" }, s.title),
              el("span", { class: "pm-process-text" }, s.text),
            ])
          )),
          el("div", { class: "pm-guide-actions" }, [
            el("a", { class: "pm-btn pm-btn--primary", href: withTopic(contactUrl, item.primary.topic), "data-label": item.primary.label }, [uiIcon("chat"), item.primary.label]),
            el("button", { type: "button", class: "pm-btn pm-btn--ghost", onclick: startGuide }, item.secondary.label),
          ]),
        ]),
        el("aside", { class: "pm-side" }, [
          el("p", { class: "pm-group-title" }, item.examples.title),
          linkList(item.examples.links),
        ]),
      ]);
    }

    function renderListPanel(item) {
      return el("div", { class: "pm-panel-inner pm-panel-inner--list" }, linkList(item.links));
    }

    function panelContent(item) {
      if (item.type === "guide") return renderGuidePanel(item);
      if (item.type === "tailor") return renderTailorPanel(item);
      if (item.type === "list") return renderListPanel(item);
      return renderMegaPanel(item);
    }

    // ---- Small popovers (log in, language) ------------------------------------
    function popover(key, triggerContent, panelChildren, align) {
      const pid = id(key);
      const btn = el("button", { type: "button", class: "pm-utility-btn", "aria-expanded": "false", "aria-controls": pid, "data-pop": key }, [triggerContent, uiIcon("chevron", "pm-chev")]);
      const pop = el("div", { class: "pm-pop" + (align === "right" ? " pm-pop--right" : ""), id: pid, hidden: true, "data-section": key }, panelChildren);
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        closeAll();
        if (!open) { btn.setAttribute("aria-expanded", "true"); pop.hidden = false; track("open", { menu_section: key }); }
      });
      return el("div", { class: "pm-pop-wrap" }, [btn, pop]);
    }

    const loginLinks = config.login ? config.login.links : [];
    const langs = config.languages;

    // ---- Search --------------------------------------------------------------
    function searchForm(where) {
      const input = el("input", { type: "search", class: "pm-search-input", placeholder: config.search.placeholder, "aria-label": "Search", autocomplete: "off" });
      const results = el("div", { class: "pm-search-results" });
      function show() {
        const q = input.value.trim();
        // On phones the popular searches appear on focus, so the guide stays near the top.
        if (!q && where === "mobile" && document.activeElement !== input) { results.replaceChildren(); return; }
        if (!q) {
          results.replaceChildren(
            el("p", { class: "pm-group-title" }, "Popular"),
            el("div", { class: "pm-chips" }, config.search.popular.map((p) =>
              el("button", { type: "button", class: "pm-chip", onclick: () => { input.value = p; show(); input.focus(); } }, p)))
          );
          return;
        }
        const hits = searchLinks(searchIndex, q, 6);
        results.replaceChildren(
          hits.length
            ? el("ul", { class: "pm-links" }, hits.map((l) => el("li", null, el("a", { class: "pm-link", href: l.url, "data-label": "Search: " + l.label }, [
                iconTile(l.icon),
                el("span", { class: "pm-link-text" }, [el("span", { class: "pm-link-label" }, l.label), el("span", { class: "pm-link-detail" }, l.detail || l.section)]),
              ]))))
            : null,
          el("a", { class: "pm-foot-link", href: config.search.url + encodeURIComponent(q), "data-label": "Search all" }, [`Search the whole site for “${q}”`, uiIcon("arrow")])
        );
      }
      input.addEventListener("input", show);
      input.addEventListener("focus", show);
      const form = el("form", { class: "pm-search", role: "search", "data-section": "search", onsubmit: (e) => {
        e.preventDefault();
        const q = input.value.trim();
        if (!q) return;
        track("search", { search_term: q, from: where });
        root.location.href = config.search.url + encodeURIComponent(q);
      } }, [
        el("div", { class: "pm-search-field" }, [uiIcon("search"), input]),
        results,
      ]);
      show();
      form.focusInput = () => input.focus();
      return form;
    }

    // ---- Desktop header ------------------------------------------------------
    const panels = {};
    const triggers = {};
    let openKey = null;
    let hoverTimer = null;

    const navItems = config.items.filter((i) => i.placement !== "utility");
    const utilityItems = config.items.filter((i) => i.placement === "utility");
    const navList = el("ul", { class: "pm-nav-list" }, navItems.map((item) => {
      const pid = "pm-panel-" + item.id;
      const btn = el("button", {
        type: "button",
        class: "pm-nav-btn pm-nav-btn--" + item.type,
        "aria-expanded": "false", "aria-controls": pid, "data-key": item.id,
      }, [
        item.type === "guide" ? uiIcon("compass", "pm-nav-icon") : null,
        el("span", null, item.label),
        uiIcon("chevron", "pm-chev"),
      ]);
      btn.addEventListener("click", () => (openKey === item.id ? closeAll(true) : openPanel(item.id)));
      // Mouse users: open on hover with a short intent delay.
      btn.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => openKey !== item.id && openPanel(item.id), openKey ? 60 : 160);
      });
      btn.addEventListener("pointerleave", () => clearTimeout(hoverTimer));
      triggers[item.id] = btn;
      panels[item.id] = el("div", { class: "pm-panel", id: pid, hidden: true, "data-section": item.id, role: "region", "aria-label": item.label }, panelContent(item));
      return el("li", null, btn);
    }));

    const searchPanel = el("div", { class: "pm-panel pm-panel--search", id: "pm-panel-search", hidden: true, role: "region", "aria-label": "Search" },
      el("div", { class: "pm-panel-inner pm-panel-inner--search" }, searchForm("desktop")));
    panels.search = searchPanel;
    const searchBtn = el("button", { type: "button", class: "pm-icon-btn", "aria-label": "Search", "aria-expanded": "false", "aria-controls": "pm-panel-search" }, uiIcon("search"));
    searchBtn.addEventListener("click", () => (openKey === "search" ? closeAll(true) : openPanel("search")));
    triggers.search = searchBtn;

    function openPanel(key, focusInside) {
      closeAll();
      openKey = key;
      triggers[key].setAttribute("aria-expanded", "true");
      panels[key].hidden = false;
      header.classList.add("is-open");
      track("open", { menu_section: key });
      if (key === "search") panels.search.querySelector("form").focusInput();
      else if (focusInside) {
        const f = panels[key].querySelector("button, a");
        if (f) f.focus();
      }
    }

    /** Jump to the guide: the desktop panel, or the top of the mobile drawer. */
    function startGuide() {
      if (!drawer.hidden) {
        const g = drawer.querySelector(".pm-drawer-guide");
        g.scrollIntoView({ behavior: "smooth", block: "start" });
        const t = g.querySelector(".pm-guide-title");
        if (t) t.focus({ preventScroll: true });
      } else openPanel("guide", true);
    }

    function closeAll(returnFocus) {
      const was = openKey;
      for (const k in panels) { panels[k].hidden = true; triggers[k].setAttribute("aria-expanded", "false"); }
      for (const b of header.querySelectorAll("[data-pop]")) { b.setAttribute("aria-expanded", "false"); b.nextElementSibling.hidden = true; }
      openKey = null;
      header.classList.remove("is-open");
      if (returnFocus && was && triggers[was]) triggers[was].focus();
    }

    const utility = el("div", { class: "pm-utility" }, el("div", { class: "pm-wrap pm-utility-row" }, [
      el("p", { class: "pm-promise" }, [uiIcon("check", "pm-promise-icon"), config.promise]),
      el("div", { class: "pm-utility-links", "data-section": "utility" }, [
        (config.utility || []).map((l) => link(l, "pm-utility-link", l.label)),
        utilityItems.map((item) => popover(item.id, item.label, linkList(item.links), "right")),
        config.login ? popover("login", [uiIcon("user"), config.login.label], linkList(loginLinks), "right") : null,
        langs ? popover("language", [uiIcon("globe"), langs.current], el("ul", { class: "pm-langs" }, langs.links.map((l) =>
          el("li", null, el("a", { href: l.url, lang: l.code.toLowerCase(), "aria-current": l.code === langs.current ? "true" : null }, [el("b", null, l.code), " ", l.label])))), "right") : null,
      ]),
    ]));

    // ---- Mobile drawer -------------------------------------------------------
    const drawerId = id("drawer");
    const burger = el("button", { type: "button", class: "pm-burger", "aria-label": "Menu", "aria-expanded": "false", "aria-controls": drawerId }, [uiIcon("menu"), el("span", null, "Menu")]);
    const drawer = el("div", { class: "pm-drawer", id: drawerId, hidden: true, role: "dialog", "aria-modal": "true", "aria-label": "Menu" }, [
      el("div", { class: "pm-drawer-head" }, [
        el("a", { class: "pm-logo", href: config.home }, el("img", { src: config.logo, alt: config.logoAlt })),
        el("button", { type: "button", class: "pm-icon-btn", "aria-label": "Close menu", onclick: () => setDrawer(false) }, uiIcon("close")),
      ]),
      el("div", { class: "pm-drawer-body" }, [
        searchForm("mobile"),
        guideItem ? el("section", { class: "pm-drawer-guide", "data-section": "guide" }, [
          el("p", { class: "pm-panel-title" }, [uiIcon("compass", "pm-title-icon"), guideItem.title]),
          el("p", { class: "pm-muted" }, guideItem.lede),
          guideView(),
        ]) : null,
        el("ul", { class: "pm-accordion" }, config.items.filter((i) => i.type !== "guide").map((item) => {
          const aid = id("acc");
          const b = el("button", { type: "button", class: "pm-acc-btn" + (item.type === "tailor" ? " pm-acc-btn--tailor" : ""), "aria-expanded": "false", "aria-controls": aid }, [el("span", null, item.label), uiIcon("chevron", "pm-chev")]);
          const body = el("div", { class: "pm-acc-body", id: aid, hidden: true, "data-section": item.id }, panelContent(item));
          b.addEventListener("click", () => {
            const open = b.getAttribute("aria-expanded") === "true";
            b.setAttribute("aria-expanded", String(!open));
            body.hidden = open;
            if (!open) track("open", { menu_section: item.id, from: "mobile" });
          });
          return el("li", null, [b, body]);
        })),
        el("div", { class: "pm-drawer-meta", "data-section": "utility" }, [
          (config.utility || []).map((l) => link(l, "pm-drawer-link", l.label)),
          loginLinks.map((l) => link(l, "pm-drawer-link", [uiIcon("user"), l.label])),
          langs ? el("div", { class: "pm-drawer-langs" }, langs.links.map((l) =>
            el("a", { href: l.url, lang: l.code.toLowerCase(), "aria-current": l.code === langs.current ? "true" : null, title: l.label }, l.code))) : null,
        ]),
      ]),
      el("div", { class: "pm-drawer-cta" }, el("a", { class: "pm-btn pm-btn--primary pm-btn--block", href: contactUrl, "data-label": "Drawer: contact" }, [uiIcon("chat"), config.contact.label])),
    ]);

    let lastFocus = null;
    function setDrawer(open) {
      drawer.hidden = !open;
      burger.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("pm-lock", open);
      if (open) {
        lastFocus = document.activeElement;
        track("open", { menu_section: "drawer" });
        drawer.querySelector(".pm-icon-btn").focus();
      } else if (lastFocus) lastFocus.focus();
    }
    burger.addEventListener("click", () => setDrawer(drawer.hidden));

    // ---- Assemble ------------------------------------------------------------
    const scrim = el("div", { class: "pm-scrim", onclick: () => closeAll() });
    const header = el("header", { class: "pronomic-menu" }, [
      utility,
      el("div", { class: "pm-bar" }, el("div", { class: "pm-wrap pm-bar-row" }, [
        el("a", { class: "pm-logo", href: config.home, "data-label": "Logo" }, el("img", { src: config.logo, alt: config.logoAlt })),
        el("nav", { class: "pm-nav", "aria-label": "Main" }, navList),
        el("div", { class: "pm-actions" }, [
          searchBtn,
          el("a", { class: "pm-btn pm-btn--primary pm-cta", href: contactUrl, "data-section": "cta", "aria-label": config.contact.label, "data-label": "Header: contact" }, [uiIcon("chat"), el("span", { class: "pm-cta-long" }, config.contact.label), el("span", { class: "pm-cta-short", "aria-hidden": "true" }, config.contact.shortLabel || config.contact.label)]),
          burger,
        ]),
      ])),
      el("div", { class: "pm-panels", onpointerleave: (e) => { if (e.pointerType === "mouse") clearTimeout(hoverTimer); } }, Object.values(panels)),
      scrim,
      drawer,
    ]);

    // Close a hover-opened panel when the mouse leaves the whole header.
    header.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse" || !openKey || openKey === "search") return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => closeAll(), 350);
    });
    header.addEventListener("pointerenter", () => clearTimeout(hoverTimer));

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!drawer.hidden) setDrawer(false);
      else if (openKey) closeAll(true);
      else {
        const pop = header.querySelector('[data-pop][aria-expanded="true"]');
        if (pop) { closeAll(); pop.focus(); }
      }
    });
    document.addEventListener("click", (e) => {
      // composedPath, not contains(): the guide re-renders, so the clicked
      // button may already be detached from the page.
      if (!e.composedPath().includes(header)) closeAll();
      else if (!e.target.closest(".pm-pop-wrap") && header.querySelector('[data-pop][aria-expanded="true"]')) {
        for (const b of header.querySelectorAll("[data-pop]")) { b.setAttribute("aria-expanded", "false"); b.nextElementSibling.hidden = true; }
      }
    });
    // Keep keyboard focus inside the drawer while it is open.
    drawer.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = [...drawer.querySelectorAll("a[href], button, input")].filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    // Leaving desktop width with the drawer open (or the reverse) resets state.
    if (root.matchMedia) root.matchMedia("(min-width: 1180px)").addEventListener("change", () => { closeAll(); if (!drawer.hidden) setDrawer(false); });

    host.replaceChildren(header);
    return { open: openPanel, close: closeAll, openDrawer: () => setDrawer(true) };
  }

  const api = { mount, handoffUrl, buildSearchIndex, searchLinks };
  root.PronomicMenu = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
