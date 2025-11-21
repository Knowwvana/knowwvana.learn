/* global bootstrap: false */
(() => {
  'use strict'
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl)
  })
})()
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("kvSidebar");
  const toggle  = document.getElementById("kvSidebarToggle");

  if (!sidebar || !toggle) return;

  toggle.addEventListener("click", function () {
    sidebar.classList.toggle("kv-sidebar--collapsed");
  });
});
