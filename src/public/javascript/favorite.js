console.log('Script carregado'); // Adicione esta linha
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM totalmente carregado e analisado'); // Adicione esta linha
    document.querySelectorAll('.favoritos-remover-botao').forEach(button => {
        console.log('Associando evento de clique ao botão:', button); // Adicione esta linha
        button.addEventListener('click', async () => {
            const bookId = button.getAttribute('data-book-id');
            console.log('Tentando remover favorito:', bookId); // Adicione esta linha
            try {
                const response = await fetch(`http://localhost:3333/user/book/${bookId}/unfavorite`, { // Atualize esta linha
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    console.log('Favorito removido com sucesso:', bookId); // Adicione esta linha
                    document.getElementById(`book-${bookId}`).remove();
                } else {
                    console.error('Erro ao remover favorito');
                }
            } catch (error) {
                console.error('Erro ao remover favorito:', error);
            }
        });
    });
});