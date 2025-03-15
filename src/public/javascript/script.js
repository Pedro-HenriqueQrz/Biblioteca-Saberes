// Menu Hamburguer
document.addEventListener('DOMContentLoaded', function () {
    const hamburguer = document.querySelector('.hamburguer');
    const menu = document.querySelector('.menu');

    hamburguer.addEventListener('click', function () {
        menu.classList.toggle('active');
    });
});

// Seleciona os elementos do footer
const footerNome = document.querySelector('.footer .footer-nome');
const footerDireitos = document.querySelector('.footer p:last-child');

//Fade-in página principal
document.addEventListener("DOMContentLoaded", function() {
    const cards = document.querySelectorAll('.fade-in-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 }); // Dispara a animação quando 10% do card estiver visível

    function observeCards() {
        cards.forEach(card => {
            card.style.opacity = 0;
            card.style.transform = 'translateY(20px)';
            observer.observe(card);
        });
    }

    observeCards();

});

// Script para mostrar/esconder a senha
document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', () => {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }
});

// Define o conteúdo dos elementos
footerNome.textContent = 'Acervo de livros digitais - Saberes';
footerDireitos.textContent = '\u00A9 2025 - Todos os direitos reservados'; // \u00A9 é o símbolo de copyright

// Carrossel Menu
document.addEventListener('DOMContentLoaded', function () {
    const carrossel = document.querySelector('.carrossel-container');
    const slides = document.querySelectorAll('.slide');
    const bolinhas = document.querySelectorAll('.bolinha');
    
    let index = 0;
    let startX = 0;
    let isDragging = false;

    // Define a primeira bolinha como ativa ao carregar a página
    bolinhas[0].classList.add('ativa');

    function moverCarrossel(novoIndex) {
        if (novoIndex < 0) {
            index = slides.length - 1;
        } else if (novoIndex >= slides.length) {
            index = 0;
        } else {
            index = novoIndex;
        }

        const offset = -index * 100;
        carrossel.style.transform = `translateX(${offset}%)`;

        // Atualiza a bolinha ativa
        bolinhas.forEach((bolinha, i) => {
            bolinha.classList.toggle('ativa', i === index);
        });
    }

    // Navegação pelas bolinhas
    bolinhas.forEach((bolinha, i) => {
        bolinha.addEventListener('click', () => moverCarrossel(i));
    });

    function startDrag(e) {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        carrossel.style.transition = 'none';
    }

    function dragMove(e) {
        if (!isDragging) return;

        const moveX = (e.type === 'mousemove' ? e.pageX : e.touches[0].pageX) - startX;
        const offset = -index * 100 + moveX / window.innerWidth * 100;
        carrossel.style.transform = `translateX(${offset}%)`;
    }

    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;

        const moveX = (e.type === 'mouseup' ? e.pageX : e.changedTouches[0].pageX) - startX;
        if (moveX > 50) {
            moverCarrossel(index - 1);
        } else if (moveX < -50) {
            moverCarrossel(index + 1);
        } else {
            moverCarrossel(index);
        }

        carrossel.style.transition = 'transform 0.5s ease';
    }

    // Adiciona os eventos de drag para mouse e touch
    carrossel.addEventListener('mousedown', startDrag);
    carrossel.addEventListener('mousemove', dragMove);
    carrossel.addEventListener('mouseup', endDrag);
    carrossel.addEventListener('mouseleave', endDrag);

    carrossel.addEventListener('touchstart', startDrag);
    carrossel.addEventListener('touchmove', dragMove);
    carrossel.addEventListener('touchend', endDrag);
});
