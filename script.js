const menuButton = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const year = document.querySelector("#year");
const topButton = document.querySelector("#topBtn");

menuButton.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    navLinks.classList.remove("open");
  }
});

window.addEventListener("scroll", () => {
  if (window.scrollY > 500) {
    topButton.classList.add("show");
  } else {
    topButton.classList.remove("show");
  }
});

topButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

year.textContent = new Date().getFullYear();
