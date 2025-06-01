const bookGrid = document.getElementById('bookGrid');

function getCoverFromISBN(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
}

async function loadBooks() {
  try {
    const res = await fetch('https://shelfxpress-server.onrender.com/api/books');

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log('Received from API:', data);

    if (!Array.isArray(data)) 
    {
      throw new Error('Expected an array but got: ' + JSON.stringify(data));
    }

    data.forEach(book => 
    {
      const image = getCoverFromISBN(book.isbn);
      const card = document.createElement('div');
      card.className = 'book-card';

      const img = document.createElement('img');
      img.src = image;
      img.alt = book.title;
      img.onerror = function () 
      {
        console.warn(`Missing cover for ISBN ${book.isbn}, using fallback.`);
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
      `;

      bookGrid.appendChild(card);
    });

  } catch (err) {
    console.error('Failed to load books:', err);
    bookGrid.innerHTML = `<p style="color: red;">Error loading books. Check the console for details.</p>`;
  }
}


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
    if (event.target === loginModal) {
      loginModal.style.display = 'none';
    }
  });


  // Login logic
  const loginBtn = document.getElementById('loginBtn');
  loginBtn?.addEventListener('click', async () => {
    const userType = document.getElementById('userType').value;
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');

    if (!identifier || !password) 
    {
      message.textContent = 'Please fill in all fields.';
      return;
    }

    const payload = userType === 'customer'
      ? { email: identifier, password }
      : { username: identifier, password };

    try 
    {
      const res = await fetch(`https://shelfxpress-server.onrender.com/api/login/${userType}`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) 
      {
        message.style.color = 'red';
        message.textContent = data || 'Login failed.';
      } 
      else 
      {
        message.style.color = 'green';
        message.textContent = `Logged in as ${data.name} (${data.role})`;
        console.log('Login successful:', data);

        if (data.role === 'employee') 
        {
          // Delay to show message briefly
          setTimeout(() => 
          {
            window.location.href = 'employee.html';
          }, 1000);
        }
      }

    } 
    catch (err) 
    {
      console.error('Login error:', err);
      message.textContent = 'An error occurred during login.';
    }
  });
});
