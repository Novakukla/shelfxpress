// Cart Logic
function addToCart(book) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const index = cart.findIndex(item => item.isbn === book.isbn);
  if (index !== -1) {
    cart[index].quantity++;
  } else {
    cart.push({ ...book, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${book.title} added to cart.`);
}

function showCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartContents = document.getElementById('cartContents');
  const cartTotal = document.getElementById('cartTotal');

  if (cart.length === 0) {
    cartContents.innerHTML = '<p>Your cart is empty.</p>';
    cartTotal.textContent = '';
  } else {
    cartContents.innerHTML = '';
    let total = 0;
    cart.forEach((item, i) => {
      total += item.quantity * 10; // Flat $10 per book
      const div = document.createElement('div');
      div.innerHTML = `
        <p>${item.title} by ${item.author} — Quantity: ${item.quantity}
        <button onclick="removeFromCart(${i})">Remove</button></p>
      `;
      cartContents.appendChild(div);
    });
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  }

  document.getElementById('cartModal').style.display = 'block';
}

function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  showCart();
}

const bookGrid = document.getElementById('bookGrid');

function getCoverFromISBN(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
}

async function loadBooks() {
  try {
    const res = await fetch('https://shelfxpress-server.onrender.com/api/books');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Expected an array.');

    data.forEach(book => {
      const image = getCoverFromISBN(book.isbn);
      const card = document.createElement('div');
      card.className = 'book-card';

      const img = document.createElement('img');
      img.src = image;
      img.alt = book.title;
      img.onerror = function () {
        const fallback = new Image();
        fallback.src = 'images/fallbackCover.jpg';
        fallback.alt = book.title;
        fallback.className = this.className;
        this.replaceWith(fallback);
      };

      card.appendChild(img);
      card.innerHTML += `
        <h2>${book.title}</h2>
        <p>${book.author}</p>
        <button class="add-to-cart" data-isbn="${book.isbn}" data-title="${book.title}" data-author="${book.author}">Add to Cart</button>
      `;

      card.querySelector('.add-to-cart').addEventListener('click', (e) => {
        const { isbn, title, author } = e.target.dataset;
        addToCart({ isbn, title, author });
      });

      bookGrid.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load books:', err);
    bookGrid.innerHTML = `<p style="color: red;">Error loading books.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadBooks();

  document.getElementById('toggleSidebar')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('closeSidebar')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
  });

  const switchBtn = document.getElementById('switchLoginType');
  const userTypeInput = document.getElementById('userType');
  const loginTitle = document.getElementById('loginTitle');
  const identifierLabel = document.getElementById('identifierLabel');

  switchBtn?.addEventListener('click', () => {
    if (userTypeInput.value === 'customer') {
      userTypeInput.value = 'employee';
      loginTitle.textContent = 'Employee Login';
      identifierLabel.textContent = 'Username';
      switchBtn.textContent = 'Switch to Customer';
    } else {
      userTypeInput.value = 'customer';
      loginTitle.textContent = 'Customer Login';
      identifierLabel.textContent = 'Email';
      switchBtn.textContent = 'Switch to Employee';
    }
  });

  const loginModal = document.getElementById('loginModal');
  const openLoginModal = document.getElementById('openLoginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');

  openLoginModal?.addEventListener('click', () => {
    loginModal.style.display = 'block';
  });

  closeLoginModal?.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === loginModal) loginModal.style.display = 'none';
    if (event.target === document.getElementById('cartModal')) document.getElementById('cartModal').style.display = 'none';
  });

  document.getElementById('viewCartBtn')?.addEventListener('click', showCart);

  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const userType = document.getElementById('userType').value;
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');

    if (!identifier || !password) {
      message.textContent = 'Please fill in all fields.';
      return;
    }

    const payload = userType === 'customer'
      ? { email: identifier, password }
      : { username: identifier, password };

    try {
      const res = await fetch(`https://shelfxpress-server.onrender.com/api/login/${userType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        message.style.color = 'red';
        message.textContent = data || 'Login failed.';
      } else {
        message.style.color = 'green';
        message.textContent = `Logged in as ${data.name} (${data.role})`;
        console.log('Login successful:', data);

        if (data.role === 'employee') {
          setTimeout(() => {
            window.location.href = 'employee.html';
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      message.textContent = 'An error occurred during login.';
    }
  });
});
