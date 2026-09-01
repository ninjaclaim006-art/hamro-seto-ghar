// Setoghar site — content hydration layer.
// The HTML already contains default copy so the page looks correct
// immediately and works even if this fetch fails (e.g. opened as a
// local file instead of served). Once content.json changes — which is
// exactly what Decap CMS edits and commits — this script overwrites
// the page with the latest values on every load.

(function () {
  function getByPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  function applyFields(data) {
    document.querySelectorAll("[data-field]").forEach((el) => {
      const value = getByPath(data, el.getAttribute("data-field"));
      if (value !== undefined) el.textContent = value;
    });
    document.querySelectorAll("[data-field-href]").forEach((el) => {
      const value = getByPath(data, el.getAttribute("data-field-href"));
      if (value) el.setAttribute("href", value);
    });
  }

  function applyLists(data) {
    document.querySelectorAll("[data-list]").forEach((container) => {
      const items = getByPath(data, container.getAttribute("data-list"));
      const templateId = container.getAttribute("data-item-template");
      const template = document.getElementById(templateId);
      // Only replace existing content (e.g. fallback illustrations) if
      // there are actual items to show — an empty/missing list means
      // "keep whatever is already in the HTML".
      if (!Array.isArray(items) || items.length === 0 || !template) return;

      container.innerHTML = "";
      items.forEach((item) => {
        const node = template.content.cloneNode(true);
        node.querySelectorAll("[data-t]").forEach((field) => {
          const key = field.getAttribute("data-t");
          if (item[key] !== undefined) field.textContent = item[key];
        });
        node.querySelectorAll("[data-t-src]").forEach((field) => {
          const key = field.getAttribute("data-t-src");
          if (item[key]) field.setAttribute("src", item[key]);
        });
        node.querySelectorAll("[data-t-alt]").forEach((field) => {
          const key = field.getAttribute("data-t-alt");
          if (item[key] !== undefined) field.setAttribute("alt", item[key]);
        });
        container.appendChild(node);
      });
    });
  }

  fetch("content.json")
    .then((res) => {
      if (!res.ok) throw new Error("content.json not found");
      return res.json();
    })
    .then((data) => {
      applyFields(data);
      applyLists(data);
    })
    .catch(() => {
      // Fetch failed (likely opened via file:// without a local server).
      // The hardcoded HTML content is shown instead — no action needed.
    });
})();
