let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;


//nav bar
document.querySelector('.navbar-toggle').addEventListener('click', function () {
    const navbarLinks = document.querySelector('.navbar-links');
    navbarLinks.classList.toggle('active');
});


//slider
function showSlide(index) {
    // Remove 'active' class from all slides
    slides.forEach((slide) => {
        slide.classList.remove('active');
    });

    // Add 'active' class to the current slide
    slides[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

// Automatically change slide every 5 seconds
setInterval(nextSlide, 5000);

// Show the first slide initially
showSlide(currentSlide);