function showAlert(message, type = 'success') {
    const alertEl = document.getElementById('alert');
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = message;
    alertEl.classList.remove('d-none');
}

function hideAlert() {
    const alertEl = document.getElementById('alert');
    alertEl.className = 'alert d-none';
    alertEl.textContent = '';
}

function renderUsers(users) { // mostra os usuarios cadastrados em uma tabela
    const container = document.getElementById('users-list');
    if (!users.length) {
        container.innerHTML = '<div class="alert alert-secondary">Nenhum usuário cadastrado ainda.</div>';
        return;
    }

    const rows = users // o método map foi usado para percorrer a lista de usuários e transformar cada um em uma linha de tabela HTML. E o join junta todas as linhas em uma única string
        .map((u, index) => `<tr><td> 
        ${index + 1}</td><td> 
        ${u.name}</td><td>
        ${u.email}</td><td>
        ${u.course}</td><td>
        ${u.turn}</td></tr>`)
        .join('');

    container.innerHTML = `
        <table class="table table-striped table-sm align-middle">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Curso</th>
                    <th>Turno</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

async function loadUsers() { // consulta os usuarios
    try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Erro ao carregar usuários');
        const data = await res.json();
        renderUsers(data);
    } catch (err) {
        console.error(err);
        document.getElementById('users-list').innerHTML = '<div class="alert alert-danger">Não foi possível carregar os usuários no momento.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const clearBtn = document.getElementById('clear-storage');

    loadUsers();

    form.addEventListener('submit', async (event) => { // cadastra
        event.preventDefault();
        hideAlert();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const course = document.getElementById('course').value.trim();
        const turn = document.getElementById('turn').value;

        if (!name || !email || !password || !confirmPassword || !course || !turn) {
            showAlert('Preencha todos os campos antes de continuar.', 'warning');
            return;
        }

        if (password.length < 6) {
            showAlert('A senha deve ter pelo menos 6 caracteres.', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('As senhas não coincidem. Verifique e tente novamente.', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, course, turn }),
            });

            const body = await response.json();
            if (!response.ok) {
                showAlert(body.message || 'Erro ao cadastrar', 'danger');
                return;
            }

            form.reset();
            showAlert('Cadastro realizado com sucesso!', 'success');
            await loadUsers();
        } catch (err) {
            console.error(err);
            showAlert('Erro de conexão ao cadastrar.', 'danger');
        }
    });

    clearBtn.addEventListener('click', async () => {
        hideAlert();
        try {
            const res = await fetch('/api/users', { method: 'DELETE' }); // envia os dados para o servidor
            if (!res.ok) throw new Error('Falha ao limpar');
            showAlert('Banco de dados limpo.', 'info');
            await loadUsers(); // att a lista de users
        } catch (err) {
            console.error(err);
            showAlert('Não foi possível limpar agora.', 'danger');
        }
    });
});
