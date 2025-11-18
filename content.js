
function sanitizeTagLabel(label = "") {
  const firstLine = label.split("\n")[0];
  return firstLine.split(" - ")[0].trim();
}

function getControllers() {
  return [...document.querySelectorAll(".opblock-tag-section")]
    .map(section => {
      const tagEl = section.querySelector(".opblock-tag");
      const raw = tagEl?.innerText.trim();
      const clean = sanitizeTagLabel(raw);

      if (tagEl && clean) {
        tagEl.childNodes[0].textContent = clean;
      }

      return clean ? { name: clean, el: section } : null;
    })
    .filter(Boolean);
}

function injectStyles() {
  if (document.getElementById("swagger-filter-styles")) return;

  const styles = document.createElement("style");
  styles.id = "swagger-filter-styles";
  styles.textContent = `
    #swagger-filter-sidebar {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 260px;
      max-height: 520px;
      z-index: 99999;
      border-radius: 16px;
      background: #ffffff;
      box-shadow: 0 18px 36px rgba(21, 35, 53, 0.12);
      font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
      color: #1f2937;
      border: 1px solid rgba(16, 185, 129, 0.25);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #swagger-filter-sidebar .sfs-header {
      padding: 18px 20px 14px;
      border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    }

    #swagger-filter-sidebar .sfs-title {
      margin: 0;
      font-size: 17px;
      font-weight: 600;
      color: #0f172a;
    }

    #swagger-filter-sidebar .sfs-subtitle {
      margin-top: 4px;
      font-size: 13px;
      color: #475569;
    }

    #swagger-filter-sidebar .sfs-toggle-btn {
      margin-top: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid rgba(15, 23, 42, 0.12);
      background: #f8fff5;
      color: #0f172a;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    #swagger-filter-sidebar .sfs-toggle-btn:hover {
      background: #ebfde4;
      border-color: rgba(28, 153, 76, 0.5);
    }

    #swagger-filter-sidebar .sfs-toggle-btn .sft-icon {
      font-size: 14px;
      color: #1c994c;
    }

    #swagger-filter-sidebar .sfs-content {
      padding: 12px 0 0;
      transition: max-height 0.25s ease, opacity 0.25s ease, padding 0.2s ease;
      max-height: 1200px;
      opacity: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    #swagger-filter-sidebar.is-collapsed .sfs-content {
      max-height: 0;
      opacity: 0;
      padding-top: 0;
    }

    #swagger-filter-sidebar .sfs-controls {
      padding: 0 20px 12px;
      border-bottom: 1px solid rgba(15, 23, 42, 0.06);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    #swagger-filter-sidebar .sfs-search {
      width: 100%;
      border: 1px solid rgba(31, 41, 55, 0.18);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 13px;
      outline: none;
      background: rgba(243, 244, 246, 0.5);
      transition: border 0.2s ease, box-shadow 0.2s ease;
    }

    #swagger-filter-sidebar .sfs-search:focus {
      border-color: #1c994c;
      box-shadow: 0 0 0 2px rgba(28, 153, 76, 0.15);
      background: #fff;
    }

    #swagger-filter-sidebar .sfs-select-all {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      font-size: 13px;
      color: #1c994c;
    }

    #swagger-filter-sidebar .sfs-list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 12px 4px 8px 4px;
    }

    #swagger-filter-sidebar .sfs-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 10px;
      margin-bottom: 4px;
      transition: background 0.2s ease;
      cursor: pointer;
    }

    #swagger-filter-sidebar .sfs-row:hover {
      background: rgba(28, 153, 76, 0.08);
    }

    #swagger-filter-sidebar .sfs-row input {
      accent-color: #1c994c;
      cursor: pointer;
    }

    #swagger-filter-sidebar .sfs-row span {
      font-size: 13px;
    }

    #swagger-filter-sidebar .sfs-footer {
      border-top: 1px solid rgba(15, 23, 42, 0.06);
      padding: 12px 18px 16px;
      font-size: 12px;
      color: #475569;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #swagger-filter-sidebar .sfs-footer a {
      color: #1c994c;
      text-decoration: none;
      font-weight: 600;
    }
  
    @media (max-width: 1100px) {
      #swagger-filter-sidebar {
        position: fixed;
        inset: auto 12px 80px 12px;
        width: auto;
        margin: 0;
        max-width: 420px;
      }

      #swagger-filter-sidebar .sfs-list {
        max-height: calc(100vh - 280px);
      }
    }

    @media (max-width: 720px) {
      #swagger-filter-sidebar {
        max-width: none;
      }
    }
  `;

  document.head.appendChild(styles);
}

function injectSidebar(controllers) {
  injectStyles();

  const sidebar = document.createElement("div");
  sidebar.id = "swagger-filter-sidebar";
  sidebar.innerHTML = `
    <div class="sfs-header">
      <p class="sfs-title">Swagger Tag Filter</p>
      <p class="sfs-subtitle">Show only the tags you need.</p>
      <button id="sfs-toggle" type="button" class="sfs-toggle-btn" aria-expanded="true">
        <span class="sft-icon">▾</span>
        <span class="sft-text">Hide tags</span>
      </button>
    </div>
    <div class="sfs-content">
      <div class="sfs-controls">
        <label class="sfs-select-all">
          <input type="checkbox" id="sfs-select-all" checked>
          Select all tags
        </label>
        <input class="sfs-search" type="search" id="sfs-search" placeholder="Search tags..." autocomplete="off">
      </div>
      <div class="sfs-list" id="sfs-list"></div>
      <div class="sfs-footer">
        <span>Built by Prince Chrix</span>
        <a href="https://github.com/PrinceChrix/swagger_filter_extension" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </div>
    </div>
  `;

  const list = sidebar.querySelector("#sfs-list");

  controllers.forEach(c => {
    const row = document.createElement("label");
    row.className = "sfs-row";
    row.dataset.label = c.name.toLowerCase();
    row.innerHTML = `
      <input class="sfs-checkbox" checked type="checkbox" data-controller="${c.name}">
      <span>${c.name}</span>
    `;
    list.appendChild(row);
  });

  document.body.appendChild(sidebar);
  setupSidebarToggle(sidebar);
}

function setupSidebarToggle(sidebar) {
  const toggleBtn = sidebar.querySelector("#sfs-toggle");
  const textEl = toggleBtn.querySelector(".sft-text");
  const iconEl = toggleBtn.querySelector(".sft-icon");
  let isVisible = true;

  function applyVisibility(visible) {
    isVisible = visible;
    sidebar.classList.toggle("is-collapsed", !visible);
    toggleBtn.setAttribute("aria-expanded", String(visible));
    textEl.textContent = visible ? "Hide tags" : "Show tags";
    iconEl.textContent = visible ? "▾" : "▸";
  }

  function handleResize() {
    const collapseByDefault = window.innerWidth < 1100;
    if (collapseByDefault && !toggleBtn.dataset.userToggled) {
      applyVisibility(false);
    }

    if (!collapseByDefault && !isVisible && !toggleBtn.dataset.userToggled) {
      applyVisibility(true);
    }
  }

  toggleBtn.addEventListener("click", () => {
    const nextVisible = sidebar.classList.contains("is-collapsed");
    toggleBtn.dataset.userToggled = "true";
    applyVisibility(nextVisible);
  });

  window.addEventListener("resize", handleResize);
  handleResize();
  if (!toggleBtn.dataset.userToggled) {
    applyVisibility(window.innerWidth >= 1100);
  }
}

function toggleControllerVisibility(controllers, name, visible) {
  const controller = controllers.find(c => c.name === name);
  if (controller) {
    controller.el.style.display = visible ? "block" : "none";
  }
}

function syncSelectAll(checkboxes, selectAllEl) {
  const checkedCount = [...checkboxes].filter(cb => cb.checked).length;
  selectAllEl.checked = checkedCount === checkboxes.length;
  selectAllEl.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
}

function activateFiltering(controllers) {
  const sidebar = document.getElementById("swagger-filter-sidebar");
  const selectAllEl = sidebar.querySelector("#sfs-select-all");
  const searchInput = sidebar.querySelector("#sfs-search");
  const checkboxes = sidebar.querySelectorAll(".sfs-checkbox");

  checkboxes.forEach(input => {
    input.addEventListener("change", () => {
      toggleControllerVisibility(controllers, input.dataset.controller, input.checked);
      syncSelectAll(checkboxes, selectAllEl);
    });
  });

  selectAllEl.addEventListener("change", () => {
    checkboxes.forEach(input => {
      input.checked = selectAllEl.checked;
      toggleControllerVisibility(controllers, input.dataset.controller, input.checked);
    });
    selectAllEl.indeterminate = false;
  });

  searchInput.addEventListener("input", e => {
    const query = e.target.value.trim().toLowerCase();
    sidebar.querySelectorAll(".sfs-row").forEach(row => {
      row.style.display = row.dataset.label.includes(query) ? "flex" : "none";
    });
  });
}

function init() {
  const interval = setInterval(() => {
    const controllers = getControllers();
    if (controllers.length > 0) {
      clearInterval(interval);
      injectSidebar(controllers);
      activateFiltering(controllers);
    }
  }, 1000);
}

init();
