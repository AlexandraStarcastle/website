/*
 * Pronomic Lifting Advisor — engine + UI.
 *
 * Usage:
 *   <div id="pronomic-advisor"></div>
 *   <script src="advisor-config.js"></script>
 *   <script src="advisor.js"></script>
 *   <script>PronomicAdvisor.mount("#pronomic-advisor");</script>
 */
(function (root) {
  "use strict";

  // ---------------------------------------------------------------------------
  // Engine (pure functions, no DOM)
  // ---------------------------------------------------------------------------

  function answerValues(answers, qid) {
    const v = answers[qid];
    if (v == null) return [];
    return Array.isArray(v) ? v : [v];
  }

  function findOption(config, qid, value) {
    const q = config.questions.find((q) => q.id === qid);
    return q && q.options.find((o) => o.value === value);
  }

  /** Score one product. Returns null if the product is excluded. */
  function scoreProduct(product, answers, config) {
    let score = 0;
    const reasons = [];
    const warnings = [];

    // Hard exclusions
    for (const qid in product.exclude || {}) {
      const bad = product.exclude[qid];
      if (answerValues(answers, qid).some((v) => bad.includes(v))) return null;
    }

    // Capacity
    const weightOpt = findOption(config, "weight", answers.weight);
    if (weightOpt && weightOpt.kg && product.capacityKg) {
      const [loadMin, loadMax] = weightOpt.kg;
      const [, capMax] = product.capacityKg;
      if (capMax < loadMin || (loadMin > 0 && capMax <= loadMin)) return null;
      if (capMax < loadMax) {
        score -= 3;
        warnings.push("Your heaviest loads may be above the standard range. Check the model with us.");
      } else {
        score += 2;
      }
    }

    // Weighted answers
    for (const qid in product.score || {}) {
      const table = product.score[qid];
      for (const v of answerValues(answers, qid)) {
        if (table[v] != null) score += table[v];
      }
    }

    // Reasons shown to the visitor
    for (const key in product.reasons || {}) {
      const [qid, v] = key.split(":");
      if (answerValues(answers, qid).includes(v)) reasons.push(product.reasons[key]);
    }

    return { product, score, reasons, warnings };
  }

  /** Rank all products for a set of answers. */
  function recommend(answers, config) {
    config = config || root.PRONOMIC_ADVISOR_CONFIG;
    const ranked = (config.solutions || config.products)
      .map((p) => scoreProduct(p, answers, config))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    const max = config.maxResults || 3;
    const top = ranked.filter((r) => r.score > 0).slice(0, max);

    const notes = [];
    for (const key in config.notes || {}) {
      const [qid, v] = key.split(":");
      if (answerValues(answers, qid).includes(v)) notes.push(config.notes[key]);
    }

    return { results: top, notes };
  }

  function summarizeAnswers(answers, config) {
    return config.questions
      .filter((q) => answerValues(answers, q.id).length)
      .map((q) => {
        const labels = answerValues(answers, q.id).map((v) => {
          const o = findOption(config, q.id, v);
          return o ? o.label : v;
        });
        return `${q.title} ${labels.join(", ")}`;
      });
  }

  // ---------------------------------------------------------------------------
  // Icons (48×48 line drawings, stroke = currentColor)
  // ---------------------------------------------------------------------------

  const ICONS = {
    // Load types
    boxes: "M8 24h16v16H8zM24 24h16v16H24zM14 8h20v16H14zM16 24v5M32 24v5M24 8v5",
    rolls: "M14 12h22M14 36h22M36 12a6 12 0 0 1 0 24M14 12a6 12 0 1 0 0 24a6 12 0 1 0 0-24zM14 21a1.6 3 0 1 0 0 6a1.6 3 0 1 0 0-6z",
    panels: "M8 38l8-28h5l-8 28zM19 38l8-28h5l-8 28zM30 38l8-28h4l-8 28z",
    servers: "M11 7h26v34H11zM11 18h26M11 29h26M16 12.5h8M16 23.5h8M16 34.5h8M31 12.5h1M31 23.5h1M31 34.5h1",
    drums: "M12 12a12 4 0 1 0 24 0a12 4 0 1 0-24 0M12 12v24a12 4 0 0 0 24 0V12M12 20a12 4 0 0 0 24 0M12 28a12 4 0 0 0 24 0",
    parts: "M24 6l15.6 9v18L24 42 8.4 33V15zM24 17a7 7 0 1 0 0 14a7 7 0 1 0 0-14z",
    sacks: "M15 12c-3 6-5 14-4 26h26c1-12-1-20-4-26M15 12c3 1.5 15 1.5 18 0M18 8l3 4M30 8l-3 4M17 24h14",
    wheels: "M24 6a18 18 0 1 0 0 36a18 18 0 1 0 0-36zM24 15a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM24 21a3 3 0 1 0 0 6a3 3 0 1 0 0-6z",
    other: "M24 7a17 17 0 1 0 0 34a17 17 0 1 0 0-34zM19 19a5 5 0 1 1 7 4.6c-1.3.6-2 1.6-2 3V28M24 33v.5",
    // Products
    "vacuum-tube-lifter": "M6 6h36M24 6v4M20 10h8v18h-8zM20 14h8M20 18h8M20 22h8M28 22h7M12 30h24v3H12zM10 33h28v9H10z",
    "lifting-trolley": "M14 6v34M8 40h32M10 43a2 2 0 1 0 0 .1M36 43a2 2 0 1 0 0 .1M14 18h20v4H14zM20 22v4h12v-4M10 6h8",
    "server-lifter": "M14 6v34M8 40h32M10 43a2 2 0 1 0 0 .1M36 43a2 2 0 1 0 0 .1M14 22h22v3H14zM18 12h16v10H18zM18 17h16M10 6h8",
    "jib-crane": "M12 8v34M6 42h14M12 10h30M12 18l10-8M34 10v18M34 28v3a4 4 0 1 1-4 4",
    "overhead-crane": "M6 10h36M9 10v32M39 10v32M5 42h8M35 42h8M20 7h8v6h-8zM24 13v15M24 28v3a4 4 0 1 1-4 4",
    hoist: "M18 4h12v4H18zM16 8h16v12H16zM20 12h8M24 20v10M24 30v3a4 4 0 1 1-4 4",
    manipulator: "M8 42h14M15 42V26M15 26l14-10M29 16l7 12M15 26a2.5 2.5 0 1 0 0 .1M29 16a2.5 2.5 0 1 0 0 .1M32 32h8M32 32v5M40 32v5",
    "lifting-table": "M7 12h34v4H7zM7 38h34v4H7zM12 16l24 22M36 16L12 38M24 27a1.5 1.5 0 1 0 0 .1",
    "goods-lift": "M10 6h28v36H10zM10 30h28M18 22l6-6 6 6M18 36l6 4 6-4",
  };

  function icon(name, cls) {
    if (!name || !ICONS[name]) return null;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 48 48");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "pa-icon " + (cls || ""));
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", ICONS[name]);
    svg.appendChild(path);
    return svg;
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === "class") node.className = attrs[k];
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null && attrs[k] !== false) node.setAttribute(k, attrs[k]);
    }
    for (const c of [].concat(children || []).flat(Infinity)) {
      if (c == null || c === false) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  function contactHref(config, answers, product) {
    const summary = summarizeAnswers(answers, config).join("\n");
    const contact = config.contact || {};
    const subject = product ? "Question about " + product.name : "Help choosing a lifting solution";
    if (contact.email) {
      return (
        "mailto:" + contact.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent("Hi,\n\nI used the lifting advisor on your website. My answers:\n\n" + summary + "\n\n")
      );
    }
    const url = new URL(contact.url || "#", root.location.href);
    url.searchParams.set("advisor", summary);
    if (product) url.searchParams.set("product", product.id);
    return url.toString();
  }

  function fitLabel(score, topScore, index) {
    if (index === 0) return "Best match";
    return score >= topScore * 0.6 ? "Good fit" : "Also possible";
  }

  function mount(target, config) {
    config = config || root.PRONOMIC_ADVISOR_CONFIG;
    const host = typeof target === "string" ? document.querySelector(target) : target;
    if (!host) throw new Error("PronomicAdvisor: mount target not found");

    const state = { step: 0, answers: {} };
    const questions = config.questions;
    const total = questions.length;

    function emit(name, detail) {
      host.dispatchEvent(new CustomEvent("advisor:" + name, { detail, bubbles: true }));
      // Google Tag Manager / GA4, if present on the page
      if (root.dataLayer) root.dataLayer.push(Object.assign({ event: "lifting_advisor_" + name }, detail));
    }

    function canContinue(q) {
      return answerValues(state.answers, q.id).length > 0;
    }

    function goTo(step) {
      state.step = step;
      if (step === total) emit("complete", { answers: state.answers });
      render(true);
    }

    function select(q, opt) {
      if (q.type === "multi") {
        let cur = answerValues(state.answers, q.id);
        if (opt.exclusive) cur = cur.includes(opt.value) ? [] : [opt.value];
        else {
          const exclusive = q.options.filter((o) => o.exclusive).map((o) => o.value);
          cur = cur.filter((v) => !exclusive.includes(v));
          cur = cur.includes(opt.value) ? cur.filter((v) => v !== opt.value) : cur.concat(opt.value);
        }
        state.answers[q.id] = cur;
        render();
      } else {
        state.answers[q.id] = opt.value;
        // Single choice: advance automatically for a snappy flow
        goTo(nextStep());
      }
    }

    // When editing an earlier answer, jump back to the first unanswered question
    function nextStep() {
      for (let i = state.step + 1; i < total; i++) {
        if (!canContinue(questions[i])) return i;
      }
      return total;
    }

    function restart() {
      state.answers = {};
      emit("restart", {});
      goTo(0);
    }

    function renderHeader(done) {
      return el("header", { class: "pa-head" }, [
        el("div", { class: "pa-head-row" }, [
          el("p", { class: "pa-eyebrow" }, config.title || "Lifting Advisor"),
          el("p", { class: "pa-step", "aria-live": "polite" },
            done ? "Our advice" : `Step ${state.step + 1} of ${total}`),
        ]),
        el("ol", { class: "pa-segments", "aria-hidden": "true" },
          questions.map((q, i) =>
            el("li", { class: "pa-seg" + (canContinue(q) ? " is-done" : "") + (i === state.step ? " is-current" : "") })
          )
        ),
      ]);
    }

    function renderSummary(done) {
      return el("aside", { class: "pa-summary" + (done ? " is-final" : ""), "aria-label": "Your answers" }, [
        el("p", { class: "pa-summary-title" }, "Your lift"),
        el("dl", { class: "pa-summary-list" },
          questions.map((q, i) => {
            const vals = answerValues(state.answers, q.id);
            const labels = vals.map((v) => (findOption(config, q.id, v) || {}).label || v);
            const answered = vals.length > 0;
            const row = el("div", { class: "pa-summary-row" + (i === state.step && !done ? " is-current" : "") }, [
              el("dt", null, q.short || q.title),
              el("dd", null, answered ? labels.join(", ") : "–"),
            ]);
            return answered
              ? el("button", { type: "button", class: "pa-summary-btn", title: "Change this answer", onclick: () => goTo(i) }, row)
              : row;
          })
        ),
        done ? el("button", { type: "button", class: "pa-link", onclick: restart }, "Start over") : null,
      ]);
    }

    function renderQuestion(q) {
      const selected = answerValues(state.answers, q.id);
      const isMulti = q.type === "multi";
      const isScale = q.options.every((o) => o.kg);
      const hasIcons = q.options.some((o) => o.icon);
      const last = state.step === total - 1;

      return el("section", { class: "pa-main pa-enter" }, [
        el("p", { class: "pa-qnum", "aria-hidden": "true" }, String(state.step + 1).padStart(2, "0")),
        el("h2", { class: "pa-title", tabindex: "-1" }, q.title),
        q.help ? el("p", { class: "pa-help" }, q.help) : null,
        el(
          "div",
          {
            class: "pa-options" + (isScale ? " pa-options--scale" : hasIcons ? " pa-options--tiles" : ""),
            role: isMulti ? "group" : "radiogroup",
            "aria-label": q.title,
          },
          q.options.map((o, i) =>
            el(
              "button",
              {
                type: "button",
                class: "pa-option" + (selected.includes(o.value) ? " is-selected" : ""),
                role: isMulti ? "checkbox" : "radio",
                "aria-checked": String(selected.includes(o.value)),
                onclick: () => select(q, o),
              },
              [
                isScale
                  ? el("span", { class: "pa-scale-bar", "aria-hidden": "true", style: `--h:${(i + 1) / q.options.length}` })
                  : null,
                hasIcons ? icon(o.icon, "pa-option-icon") : null,
                isMulti ? el("span", { class: "pa-check", "aria-hidden": "true" }) : null,
                el("span", { class: "pa-option-text" }, [
                  el("span", { class: "pa-option-label" }, o.label),
                  o.hint ? el("span", { class: "pa-option-hint" }, o.hint) : null,
                ]),
              ]
            )
          )
        ),
        el("div", { class: "pa-nav" }, [
          state.step > 0
            ? el("button", { type: "button", class: "pa-link", onclick: () => goTo(state.step - 1) }, "← Back")
            : el("span"),
          isMulti || canContinue(q)
            ? el("button", {
                type: "button", class: "pa-btn pa-btn-primary", disabled: !canContinue(q),
                onclick: () => goTo(isMulti ? Math.max(nextStep(), state.step + 1) : nextStep()),
              }, last ? "Show my recommendation" : "Next")
            : null,
        ]),
      ]);
    }

    function productLink(r, i, cls, text) {
      return el("a", {
        class: cls, href: r.product.url,
        onclick: () => emit("product_click", { product: r.product.id, rank: i + 1 }),
      }, text);
    }

    function renderBest(r) {
      const p = r.product;
      const tip = p.loadTips && p.loadTips[state.answers.load];
      const builder = p.probldr && config.probldr;
      return el("article", { class: "pa-best" }, [
        el("div", { class: "pa-best-visual" }, [
          p.image ? el("img", { src: p.image, alt: "" }) : icon(p.icon, "pa-best-icon"),
        ]),
        el("div", { class: "pa-best-body" }, [
          el("p", { class: "pa-fit pa-fit--best" }, "Our advice"),
          el("h3", { class: "pa-best-name" }, p.name),
          el("p", { class: "pa-advice" }, p.advice),
          r.reasons.length
            ? el("ul", { class: "pa-reasons" }, r.reasons.slice(0, 3).map((t) => el("li", null, t)))
            : null,
          tip
            ? el("p", { class: "pa-tip" }, [
                el("strong", null, "Tip for your load: "),
                tip.text + " ",
                tip.url ? el("a", { href: tip.url }, "Read more") : null,
              ])
            : null,
          r.warnings.map((w) => el("p", { class: "pa-warning" }, w)),
          p.products && p.products.length
            ? el("div", { class: "pa-products" }, [
                el("p", { class: "pa-products-title" }, "Products to look at"),
                el("ul", null, p.products.map((x) =>
                  el("li", null, el("a", {
                    href: x.url,
                    onclick: () => emit("product_click", { product: p.id, item: x.name, rank: 1 }),
                  }, [el("span", { class: "pa-product-name" }, x.name), el("span", { class: "pa-product-detail" }, x.detail)]))
                )),
              ])
            : null,
          el("div", { class: "pa-actions" }, [
            builder
              ? el("a", {
                  class: "pa-btn pa-btn-accent", href: builder.url,
                  onclick: () => emit("probldr_click", { product: p.id }),
                }, builder.label)
              : productLink(r, 0, "pa-btn pa-btn-primary", "See the products"),
            builder
              ? productLink(r, 0, "pa-btn pa-btn-secondary", "See the products")
              : el("a", {
                  class: "pa-btn pa-btn-secondary",
                  href: contactHref(config, state.answers, p),
                  onclick: () => emit("contact_click", { product: p.id }),
                }, "Ask an expert"),
          ]),
        ]),
      ]);
    }

    function renderAlt(r, i, topScore) {
      return el("article", { class: "pa-alt" }, [
        el("div", { class: "pa-alt-head" }, [
          el("span", { class: "pa-alt-visual" }, icon(r.product.icon, "pa-alt-icon")),
          el("div", null, [
            el("p", { class: "pa-fit" }, fitLabel(r.score, topScore, i)),
            el("h4", { class: "pa-alt-name" }, r.product.name),
          ]),
        ]),
        el("p", { class: "pa-summary-text" }, r.product.summary),
        r.reasons[0] ? el("ul", { class: "pa-reasons" }, el("li", null, r.reasons[0])) : null,
        productLink(r, i, "pa-arrow-link", "Read more →"),
      ]);
    }

    function renderResults() {
      const { results, notes } = recommend(state.answers, config);
      emit("results", { products: results.map((r) => r.product.id) });
      const topScore = results.length ? results[0].score : 0;
      const apps = config.applications || {};
      const app = apps[state.answers.load] || apps._default;

      return el("section", { class: "pa-main pa-enter" }, [
        el("h2", { class: "pa-title", tabindex: "-1" },
          results.length ? "Here's how we would solve your lift" : "Your lift needs a tailored solution"),
        el("p", { class: "pa-help" },
          results.length
            ? "Based on your answers. Click any of your answers to change it."
            : "None of our standard solutions matches all your answers, but our application experts design tailored lifting solutions every day."),
        results.length ? renderBest(results[0]) : null,
        results.length > 1
          ? el("div", { class: "pa-alts" }, [
              el("h3", { class: "pa-alts-title" }, "Other ways to solve it"),
              el("div", { class: "pa-alts-grid" }, results.slice(1).map((r, i) => renderAlt(r, i + 1, topScore))),
            ])
          : null,
        notes.length ? el("div", { class: "pa-notes" }, notes.map((n) => el("p", null, n))) : null,
        app ? el("a", { class: "pa-arrow-link pa-app-link", href: app.url }, `See more ways to lift ${app.label} →`) : null,
        el("div", { class: "pa-cta" }, [
          el("div", { class: "pa-cta-text" }, [
            el("h3", null, "Want help with the details?"),
            el("p", null, "Send us your answers. An application expert will suggest the right model, tool and set-up for your workplace."),
          ]),
          el("a", {
            class: "pa-btn pa-btn-accent",
            href: contactHref(config, state.answers),
            onclick: () => emit("contact_click", {}),
          }, "Talk to an expert"),
        ]),
      ]);
    }

    function render(focus) {
      const done = state.step >= total;
      host.replaceChildren(
        el("div", { class: "pronomic-advisor" + (done ? " is-done" : "") }, [
          renderHeader(done),
          el("div", { class: "pa-body" }, [
            done ? renderResults() : renderQuestion(questions[state.step]),
            renderSummary(done),
          ]),
        ])
      );

      if (focus) {
        const h = host.querySelector(".pa-title");
        if (h) h.focus({ preventScroll: true });
        const top = host.getBoundingClientRect().top;
        if (top < 0) host.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    emit("start", {});
    render();
    return { restart, getAnswers: () => Object.assign({}, state.answers) };
  }

  const api = { mount, recommend, scoreProduct, summarizeAnswers };
  root.PronomicAdvisor = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
