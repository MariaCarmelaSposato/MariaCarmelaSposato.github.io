document.addEventListener('DOMContentLoaded', () => {
  
  // Image Error Handler: Auto-switch between .jpg, .png, .svg
  document.addEventListener('error', (e) => {
    if (e.target.tagName.toLowerCase() === 'img') {
      const img = e.target;
      const src = img.src;
      const extensions = ['.jpg', '.png', '.svg'];
      
      // Get current extension
      let currentExt = '';
      extensions.forEach(ext => {
        if (src.toLowerCase().endsWith(ext)) currentExt = ext;
      });

      if (currentExt) {
        // Init retry counter
        let retryCount = parseInt(img.getAttribute('data-retry') || '0');
        
        if (retryCount < extensions.length - 1) {
          // Find next extension in loop
          let currentIndex = extensions.indexOf(currentExt);
          let nextIndex = (currentIndex + 1) % extensions.length;
          let nextExt = extensions[nextIndex];
          
          // Update src and increment retry
          img.setAttribute('data-retry', retryCount + 1);
          img.src = src.substring(0, src.length - currentExt.length) + nextExt;
          console.log(`Image failed. Retrying with ${nextExt}: ${img.src}`);
        }
      }
    }
  }, true); // Use capture phase to catch error events early

  // Drawer Menu functionality
  const menuToggle = document.getElementById('menu-toggle');
  const drawerMenu = document.getElementById('drawer-menu');
  const drawerClose = document.getElementById('drawer-close');

  if (menuToggle && drawerMenu) {
    menuToggle.addEventListener('click', () => {
      drawerMenu.classList.add('active');
    });
  }

  if (drawerClose && drawerMenu) {
    drawerClose.addEventListener('click', () => {
      drawerMenu.classList.remove('active');
    });
  }

  // Lightbox functionality
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxText = document.querySelector('.lightbox-text');
  const lightboxMore = document.getElementById('lightbox-more');
  const lightboxClose = document.getElementById('lightbox-close');
  
  // Supporto lightbox per la Home (.hero-item) e per gli elementi tecnici (.lightbox-trigger)
  const clickItems = document.querySelectorAll('.hero-item, .lightbox-trigger');

  clickItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const img = item.querySelector('img');
      if(img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        
        // Populate text if fields exist
        if (lightboxTitle && lightboxDesc) {
          let title = item.getAttribute('data-title');
          let desc = item.getAttribute('data-desc');
          
          // Fallback to portfolio overlay structures if data attributes missing
          if (!title && item.querySelector('.portfolio-info h3')) {
            title = item.querySelector('.portfolio-info h3').innerText;
          }
          if (!desc && item.querySelector('.portfolio-info p')) {
            desc = item.querySelector('.portfolio-info p').innerText;
          }

          lightboxTitle.innerText = title || '';
          lightboxDesc.innerText = desc || '';
        }

        // Reset text section logic
        if (lightboxText && lightboxMore) {
          lightboxText.classList.remove('show');
          lightboxMore.innerText = 'Scopri di più';
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    });
  });

  // Toggle testuale "Scopri di più"
  if (lightboxMore && lightboxText) {
    lightboxMore.addEventListener('click', () => {
      lightboxText.classList.toggle('show');
      if (lightboxText.classList.contains('show')) {
        lightboxMore.innerText = 'Nascondi';
      } else {
        lightboxMore.innerText = 'Scopri di più';
      }
    });
  }

  // Close Lightbox
  if(lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      
      // Reset logic for next open
      if (lightboxText && lightboxMore) {
        lightboxText.classList.remove('show');
        lightboxMore.innerText = 'Scopri di più';
      }
    });
  };

  const closeLightbox = () => {
    if(lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    }
  };

  if(lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if(lightbox) {
    lightbox.addEventListener('click', (e) => {
      // Close if clicked outside the image
      if (e.target === lightbox) {
         closeLightbox();
      }
    });
  }

  // Escape key to close lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Custom Cursor Logic
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.style.opacity = '0';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.opacity = '1';
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    // Controlla in tempo reale se il cursore è sopra un'immagine interattiva
    const isOverImage = e.target.closest('.category-image, .hero-item, .portfolio-item');
    if (isOverImage) {
      cursor.classList.add('hover');
    } else {
      cursor.classList.remove('hover');
    }
  });


  // Intersection Observer for Reveal-on-Scroll animations
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Animazione eseguita una sola volta
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  revealElements.forEach(el => observer.observe(el));

  // Se è un dispositivo puramente touch, il cursore non si muoverà mai e rimarrà invisibile.
  // Ma per sicurezza ripristiniamo il cursore standard se viene rilevato un tocco prolungato.
  window.addEventListener('touchstart', () => {
    cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
  }, {once: true});

  // Portfolio Filtering Logic (if on progetti.html)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  const portfolioTitle = document.getElementById('portfolio-title');
  const portfolioDesc = document.getElementById('portfolio-desc');
  
  if (filterBtns.length > 0 && portfolioItems.length > 0) {
    const defaultHeader = document.getElementById('default-portfolio-header');
    const categoryHeroSection = document.getElementById('category-hero-section');
    const portfolioFilters = document.getElementById('portfolio-filters');
    const catHeroTitle = document.getElementById('cat-hero-title');
    const catHeroDesc = document.getElementById('cat-hero-desc');
    const catHeroImg = document.getElementById('cat-hero-img');
    const portfolioSection = document.getElementById('portfolio-section');

    const categoryData = {
      'interior': { title: 'Interior Design', desc: 'Progettiamo spazi cuciti su misura per te. Che tu preferisca linee morbide e avvolgenti o geometrie più pulite, il nostro obiettivo è trovare sempre la perfetta armonia visiva, creando ambienti in cui ti sentirai a casa.', img: 'assets/home-interior.png' },
      'product': { title: 'Product Design', desc: 'Oggetti di uso quotidiano plasmati dalla luce e dalle curve, pensati per accompagnare con dolcezza i gesti della vita.', img: 'assets/exhibit-1.jpg' },
      'exhibit': { title: 'Exhibit Design', desc: 'Progettazione di stand ed esposizioni che guidano il visitatore in un\'esperienza sensoriale completa, fondendo architettura ed esposizione.', img: 'assets/exhibit-1.jpg' },
      'outdoor': { title: 'Outdoor', desc: 'Scenografie e spazi aperti in cui il costruito incontra naturalmente la natura con un percorso senza stacco visivo, in pura continuità.', img: 'assets/home-outdoor.jpg' }
    };

    const applyFilter = (filterValue) => {
      // Gestione UI Intro Categoria
      if (filterValue === 'all') {
        if (defaultHeader) defaultHeader.style.display = 'block';
        if (portfolioFilters) portfolioFilters.style.display = 'flex';
        if (categoryHeroSection) categoryHeroSection.style.display = 'none';
        portfolioSection.classList.remove('has-hero'); // Ripristina il padding per mostrare correttamente il titolo
      } else {
        if (defaultHeader) defaultHeader.style.display = 'none';
        if (portfolioFilters) portfolioFilters.style.display = 'none';
        
        if (categoryHeroSection && categoryData[filterValue]) {
          catHeroTitle.innerText = categoryData[filterValue].title;
          catHeroDesc.innerText = categoryData[filterValue].desc;
          catHeroImg.src = categoryData[filterValue].img;
          categoryHeroSection.style.display = 'block';
          portfolioSection.classList.add('has-hero'); // Rimuove il padding perché c'è il banner sopra
        }
      }

      // Filter Projects
      portfolioItems.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.style.display = 'block';
          // Aggiungiamo la classe per l'animazione reveal-on-scroll anche ai progetti
          item.classList.add('reveal-on-scroll');
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.8)';
          item.classList.remove('reveal-on-scroll');
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterValue = btn.getAttribute('data-filter');
        applyFilter(filterValue);
      });
    });

    // Handle URL parameters (e.g., ?filter=interior)
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter') ? urlParams.get('filter').toLowerCase().trim() : null;

    if (filterParam) {
      const targetBtn = document.querySelector(`.filter-btn[data-filter="${filterParam}"]`);
      if (targetBtn) {
        // Applica il filtro e aggiorna il titolo
        filterBtns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        applyFilter(filterParam);
      }
    }
  }
});
