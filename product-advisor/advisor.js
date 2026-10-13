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
      if (capMax < loadMin) return null;
      if (capMax < loadMax) {
        score -= 3;
        warnings.push(`Covers loads up to ${capMax} kg. Check the model for your heaviest load.`);
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
    const ranked = config.products
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

  function contactHref(config, answers) {
    const summary = summarizeAnswers(answers, config).join("\n");
    const contact = config.contact || {};
    if (contact.email) {
      return (
        "mailto:" + contact.email +
        "?subject=" + encodeURIComponent("Help choosing a lifting solution") +
        "&body=" + encodeURIComponent("Hi,\n\nI used the lifting advisor on your website. My answers:\n\n" + summary + "\n\n")
      );
    }
    const url = new URL(contact.url || "#", root.location.href);
    url.searchParams.set("advisor", summary);
    return url.toString();
  }

  function mount(target, config) {
    config = config || root.PRONOMIC_ADVISOR_CONFIG;
    const host = typeof target === "string" ? document.querySelector(target) : target;
    if (!host) throw new Error("PronomicAdvisor: mount target not found");

    const state = { step: 0, answers: {} };
    const questions = config.questions;

    function emit(name, detail) {
      host.dispatchEvent(new CustomEvent("advisor:" + name, { detail, bubbles: true }));
      // Google Tag Manager / GA4, if present on the page
      if (root.dataLayer) root.dataLayer.push(Object.assign({ event: "lifting_advisor_" + name }, detail));
    }

    function canContinue(q) {
      return answerValues(state.answers, q.id).length > 0;
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
        next();
      }
    }

    function next() {
      if (state.step < questions.length) state.step++;
      if (state.step === questions.length) emit("complete", { answers: state.answers });
      render(true);
    }

    function back() {
      if (state.step > 0) state.step--;
      render(true);
    }

    function restart() {
      state.step = 0;
      state.answers = {};
      emit("restart", {});
      render(true);
    }

    function renderQuestion(q) {
      const selected = answerValues(state.answers, q.id);
      const isMulti = q.type === "multi";
      return el("div", { class: "pa-question" }, [
        el("h2", { class: "pa-title", tabindex: "-1" }, q.title),
        q.help ? el("p", { class: "pa-help" }, q.help) : null,
        el(
          "div",
          { class: "pa-options", role: isMulti ? "group" : "radiogroup", "aria-label": q.title },
          q.options.map((o) =>
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
                o.icon ? el("span", { class: "pa-option-icon", "aria-hidden": "true" }, o.icon) : null,
                el("span", { class: "pa-option-text" }, [
                  el("span", { class: "pa-option-label" }, o.label),
                  o.hint ? el("span", { class: "pa-option-hint" }, o.hint) : null,
                ]),
              ]
            )
          )
        ),
      ]);
    }

    function renderResults() {
      const { results, notes } = recommend(state.answers, config);
      emit("results", { products: results.map((r) => r.product.id) });

      const cards = results.length
        ? results.map((r, i) =>
            el("article", { class: "pa-card" + (i === 0 ? " is-best" : "") }, [
              i === 0 ? el("span", { class: "pa-badge" }, "Best match") : null,
              r.product.image ? el("img", { class: "pa-card-img", src: r.product.image, alt: "" }) : null,
              el("p", { class: "pa-card-family" }, r.product.family),
              el("h3", { class: "pa-card-name" }, r.product.name),
              el("p", { class: "pa-card-summary" }, r.product.summary),
              r.reasons.length
                ? el("ul", { class: "pa-reasons" }, r.reasons.slice(0, 3).map((t) => el("li", null, t)))
                : null,
              r.warnings.map((w) => el("p", { class: "pa-warning" }, w)),
              el(
                "a",
                {
                  class: "pa-btn " + (i === 0 ? "pa-btn-primary" : "pa-btn-secondary"),
                  href: r.product.url,
                  onclick: () => emit("product_click", { product: r.product.id, rank: i + 1 }),
                },
                "View product"
              ),
            ])
          )
        : [
            el("div", { class: "pa-empty" }, [
              el("h3", null, "This sounds like a job for a custom solution"),
              el("p", null, "None of our standard products matched all your answers. Our application experts design custom lifting solutions every day. Get in touch and we'll help."),
            ]),
          ];

      return el("div", { class: "pa-results" }, [
        el("h2", { class: "pa-title", tabindex: "-1" }, "Our recommendation"),
        el("p", { class: "pa-help" }, "Based on your answers, these lifting solutions fit your needs best."),
        el("div", { class: "pa-cards" }, cards),
        notes.length ? el("div", { class: "pa-notes" }, notes.map((n) => el("p", null, n))) : null,
        el("div", { class: "pa-cta" }, [
          el("div", null, [
            el("h3", null, "Want a second opinion?"),
            el("p", null, "Our experts can confirm the right model and configuration for your application."),
          ]),
          el(
            "a",
            {
              class: "pa-btn pa-btn-primary",
              href: contactHref(config, state.answers),
              onclick: () => emit("contact_click", {}),
            },
            "Talk to an expert"
          ),
        ]),
        el("button", { type: "button", class: "pa-link", onclick: restart }, "↺ Start over"),
      ]);
    }

    function render(focus) {
      const done = state.step >= questions.length;
      const q = questions[state.step];
      const pct = Math.round((Math.min(state.step, questions.length) / questions.length) * 100);

      host.replaceChildren(
        el("div", { class: "pronomic-advisor" }, [
          el("div", { class: "pa-progress", "aria-hidden": "true" }, el("div", { class: "pa-progress-bar", style: `width:${pct}%` })),
          el(
            "p",
            { class: "pa-step", "aria-live": "polite" },
            done ? "Your results" : `Question ${state.step + 1} of ${questions.length}`
          ),
          done ? renderResults() : renderQuestion(q),
          done
            ? null
            : el("div", { class: "pa-nav" }, [
                state.step > 0 ? el("button", { type: "button", class: "pa-link", onclick: back }, "← Back") : el("span"),
                q.type === "multi"
                  ? el("button", { type: "button", class: "pa-btn pa-btn-primary", disabled: !canContinue(q), onclick: next },
                      state.step === questions.length - 1 ? "Show my results" : "Next")
                  : null,
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
