function showAlert(message, type = 'success') {
  const alertEl = document.getElementById('alert'); // pega o html
  alertEl.className = `alert alert-${type}`; // estilo do alerta
  alertEl.textContent = message;
  alertEl.classList.remove('d-none');
}

function hideAlert() {
  const alertEl = document.getElementById('alert');
  alertEl.className = 'alert d-none';
  alertEl.textContent = ''; // limpar o texto
}

document.addEventListener('DOMContentLoaded', () => { // garante que o js só seja executado depois que a página estiver totalmente carregada
  const form = document.getElementById('login-form');

  form.addEventListener('submit', async (event) => { // "captura" o usuario
    event.preventDefault(); // login via JavaScript sem atualizar a página.
    hideAlert();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    if (!email || !password) { //evita ter algo a vazio
      showAlert('Informe email e senha.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/login', { //envia uma requisição para a API
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        showAlert(body.message || 'Falha no login.', 'danger');
        return;
      }

      showAlert('Login realizado! Redirecionando...', 'success');

      setTimeout(() => { // aqui ele espera 900ms para mostrar a mensagem de login realizado e depois redireciona para a página inicial
        window.location.href = '../../index.html';
      }, 900);

    } catch (err) {
      console.error(err);
      showAlert('Erro de conexão. Tente novamente.', 'danger');
    }
  });
});
