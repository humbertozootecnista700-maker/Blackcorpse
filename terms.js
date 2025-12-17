// Gerencia comportamento do botão "Voltar ao topo" no modal de termos
document.addEventListener('DOMContentLoaded', () => {
    const termsCard = document.querySelector('.terms-card');
    const backToTopBtn = document.getElementById('backToTop');
    
    // Limite de scroll para mostrar o botão (100px)
    const SCROLL_THRESHOLD = 100;
    
    // Mostra/esconde o botão baseado na posição do scroll
    function toggleBackToTopButton() {
        if (!termsCard || !backToTopBtn) return;
        
        // Mostra o botão quando rolar mais que o threshold
        if (termsCard.scrollTop > SCROLL_THRESHOLD) {
            backToTopBtn.style.display = 'block';
            // Adiciona fade-in suave
            backToTopBtn.style.opacity = '1';
        } else {
            // Fade-out suave antes de esconder
            backToTopBtn.style.opacity = '0';
            // Esconde após a animação
            setTimeout(() => {
                if (termsCard.scrollTop <= SCROLL_THRESHOLD) {
                    backToTopBtn.style.display = 'none';
                }
            }, 150);
        }
    }
    
    // Adiciona transição suave para opacidade
    if (backToTopBtn) {
        backToTopBtn.style.transition = 'opacity 0.15s ease-in-out';
    }
    
    // Monitora o scroll do card de termos
    if (termsCard) {
        termsCard.addEventListener('scroll', toggleBackToTopButton);
        
        // Verifica estado inicial
        toggleBackToTopButton();
    }
});