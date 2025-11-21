/* global bootstrap: false */
(() => {
  'use strict'
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl)
  })
})();

/* === SIDEBAR COLLAPSE TOGGLE === */
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("kvSidebar");
  const toggle  = document.getElementById("kvSidebarToggle");

  if (sidebar && toggle) {
    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("kv-sidebar--collapsed");
    });
  }
});

/* === FOLDER ICON OPEN/CLOSE SYNC (Bootstrap Collapse Events) === */
document.addEventListener("DOMContentLoaded", function () {

  // Each collapsible section inside the sidebar is a .collapse element
  document.querySelectorAll(".collapse").forEach(section => {

    const id = section.getAttribute("id");

    // Match <i data-folder-icon="nav-xxx">
    const icon = document.querySelector(`i[data-folder-icon="${id}"]`);
    if (!icon) return;

    // When expanding
    section.addEventListener("show.bs.collapse", () => {
      icon.classList.remove("bi-folder");
      icon.classList.add("bi-folder2-open");
    });

    // When collapsing
    section.addEventListener("hide.bs.collapse", () => {
      icon.classList.remove("bi-folder2-open");
      icon.classList.add("bi-folder");
    });

  });

});
