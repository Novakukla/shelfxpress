const bookGrid = document.getElementById('bookGrid');

function getCoverFromISBN(isbn) {
  return `https://shelfxpress-server.onrender.com/cover/${isbn}`;
}

async function loadBooks() {
  try {
    const res = await fetch('https://shelfxpress-server.onrender.com/api/books');

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log('Received from API:', data);

    if (!Array.isArray(data)) {
      throw new Error('Expected an array but got: ' + JSON.stringify(data));
    }

    data.forEach(book => {
      const image = getCoverFromISBN(book.isbn);
      const card = document.createElement('div');
      card.className = 'book-card';
      card.innerHTML = `
        <img src="${image}" alt="${book.title}">
        <h2>${book.title}</h2>
        <p>${book.author}</p>
      `;
      bookGrid.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load books:', err);
    bookGrid.innerHTML = `<p style="color: red;">Error loading books. Check the console for details.</p>`;
  }
}


// Wait for DOM content before adding event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadBooks();

  // Sidebar open toggle
  const toggleBtn = document.getElementById('toggleSidebar');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.toggle('open');
    });
  }

  // Sidebar close button
  const closeBtn = document.getElementById('closeSidebar');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
    });
  }
});
