       document.addEventListener('DOMContentLoaded', function() {
            const feedbackCards = document.querySelectorAll('.feedback-card');
            
            // Function to check if element is in viewport
            function isInViewport(element) {
                const rect = element.getBoundingClientRect();
                return (
                    rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75
                );
            }
            
            // Function to handle scroll events
            function handleScroll() {
                feedbackCards.forEach((card, index) => {
                    if (isInViewport(card)) {
                        // Add staggered delay based on index
                        card.style.transitionDelay = `${index * 0.1}s`;
                        card.classList.add('visible');
                    }
                });
            }
            
            // Initial check in case some cards are already in viewport
            handleScroll();
            
            // Add scroll event listener
            window.addEventListener('scroll', handleScroll);
            
            // Add a small delay to trigger animations after page load
            setTimeout(() => {
                handleScroll();
            }, 300);
        });