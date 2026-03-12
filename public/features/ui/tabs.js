export function initTabGroups() {
  const tabGroups = document.querySelectorAll(".tab-buttons");

  tabGroups.forEach((group) => {
    const buttons = group.querySelectorAll(".tab-btn");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-tab");
        const container = group.closest("section");

        container
          .querySelectorAll(".tab-btn")
          .forEach((b) => b.classList.remove("active"));
        container
          .querySelectorAll(".tab-content")
          .forEach((c) => c.classList.remove("active"));

        btn.classList.add("active");
        const targetTab = container.querySelector(`#${tabId}-tab`);
        if (targetTab) targetTab.classList.add("active");
      });
    });
  });
}
