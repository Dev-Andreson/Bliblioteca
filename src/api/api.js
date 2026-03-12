async function searchBooks(query) {

    const apiKey = "AIzaSyDW_QL9PYhN5z4SICGWPo4J3ItRLZQL9Bs";
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
        console.error("Status da API:", res.status);
        throw new Error("Erro na API");
    }

    const data = await res.json();
    return data.items || [];
}

function renderBooks(books) {

    const container = document.getElementById('results');
    container.innerHTML = '';

    books.forEach(item => {

        const info = item.volumeInfo || {};

        const col = document.createElement('div');
        col.className = "col-md-3";

        col.innerHTML = `
        <div class="card h-100">
            <img src="${info.imageLinks?.thumbnail || ''}" class="card-img-top">
            <div class="card-body">
                <h6>${info.title || "Sem título"}</h6>
                <p>${info.authors?.join(", ") || "Autor desconhecido"}</p>
                <a href="${info.previewLink}" target="_blank" class="btn btn-primary">Ler</a>
            </div>
        </div>
        `;

        container.appendChild(col);

    });

}

document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById('search-btn');

    btn.addEventListener('click', () => {

        const query = document.getElementById('search-input').value.trim();

        if (!query) return;

        window.location.href = `src/livros/livros.html?q=${encodeURIComponent(query)}`;

    });

});

function getQueryParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q");
}

document.addEventListener("DOMContentLoaded", async () => {

    const query = getQueryParam();

    if (!query) return;

    try {
        const books = await searchBooks(query);
        renderBooks(books);
    } catch (e) {
        console.error(e);
    }

});