const collapsibles = document.querySelectorAll(".collapsible");
collapsibles.forEach((item) =>
  item.addEventListener("click", function () {
    this.classList.toggle("collapsible--expanded");
  })
);


const nav = document.querySelector(".nav");
const navToggler = document.querySelector(".nav-toggler");

navToggler.addEventListener("click", function () {
  nav.classList.toggle("nav--expanded");
});