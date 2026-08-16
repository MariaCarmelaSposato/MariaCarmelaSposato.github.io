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
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxText = document.querySelector('.lightbox-text');
  const lightboxMore = document.getElementById('lightbox-more');
  const lightboxClose = document.getElementById('lightbox-close');
  
  // --- NUOVA LOGICA LIGHTBOX CON SLIDER ---
  let prevBtn = document.getElementById('lightbox-prev');
  let nextBtn = document.getElementById('lightbox-next');
  
  if (lightbox && !prevBtn) {
    prevBtn = document.createElement('button');
    prevBtn.id = 'lightbox-prev';
    prevBtn.className = 'lightbox-nav lightbox-prev';
    prevBtn.innerHTML = '&#10094;';
    lightbox.querySelector('.lightbox-content').appendChild(prevBtn);
  }
  if (lightbox && !nextBtn) {
    nextBtn = document.createElement('button');
    nextBtn.id = 'lightbox-next';
    nextBtn.className = 'lightbox-nav lightbox-next';
    nextBtn.innerHTML = '&#10095;';
    lightbox.querySelector('.lightbox-content').appendChild(nextBtn);
  }
  
  // Remove dots container if it exists
  const dotsC = document.getElementById('lightbox-dots');
  if (dotsC) dotsC.remove();

  let visibleImages = [];
  let currentIndex = 0;
  let arrowTimeout;

  function showArrowsTemporarily() {
    const content = lightbox.querySelector('.lightbox-content');
    if(content) {
        content.classList.add('show-arrows');
        clearTimeout(arrowTimeout);
        arrowTimeout = setTimeout(() => {
            content.classList.remove('show-arrows');
        }, 2500);
    }
  }

  function updateLightboxContent() {
    // Reset lens state when changing images
    if (window.isLensActive && document.getElementById('lightbox-lens-toggle')) {
        window.isLensActive = false;
        document.getElementById('lightbox-lens-toggle').classList.remove('active');
        const glass = document.querySelector(".img-magnifier-glass");
        if(glass) glass.style.display = "none";
    }

    if (visibleImages.length === 0) return;
    const currentItem = visibleImages[currentIndex];

    // Rimuovi vecchi temi dalla lightbox
    lightbox.classList.remove('theme-interior', 'theme-exhibit', 'theme-outdoor', 'theme-product', 'theme-tutti');
    
    // Aggiungi tema dell'elemento corrente se presente
    Array.from(currentItem.classList).forEach(cls => {
      if (cls.startsWith('theme-')) {
        lightbox.classList.add(cls);
      }
    });
    const img = currentItem.querySelector('img');
    const video = currentItem.querySelector('video');
    
    if(lightboxImg) lightboxImg.style.display = 'none';
    if(lightboxVideo) {
      lightboxVideo.style.display = 'none';
      lightboxVideo.src = '';
    }

    if(img && lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.style.display = 'block';
      
      lightboxImg.style.maxWidth = '';
      lightboxImg.style.width = '';
      const isTechnical = img.src.toLowerCase().includes('sezione') || img.src.toLowerCase().includes('sezioni') || img.src.toLowerCase().includes('pianta') || img.src.toLowerCase().includes('piante');
      if (isTechnical) {
          lightboxImg.style.backgroundColor = 'white';
          lightboxImg.style.padding = '2rem';
          lightboxImg.style.boxSizing = 'border-box';
      } else {
          lightboxImg.style.backgroundColor = '';
          lightboxImg.style.padding = '';
          lightboxImg.style.boxSizing = '';
      }
      
      const glass = document.querySelector(".img-magnifier-glass");
      if (glass && glass.style.display === "block") {
          glass.style.backgroundImage = "url('" + img.src + "')";
      }
    } else if(video && lightboxVideo) {
      lightboxVideo.src = video.src;
      lightboxVideo.style.display = 'block';
    }
    
    if (lightboxTitle && lightboxDesc) {
      let title = currentItem.getAttribute('data-title');
      let desc = currentItem.getAttribute('data-desc');
      if (!title && currentItem.querySelector('.portfolio-info h3')) {
        title = currentItem.querySelector('.portfolio-info h3').innerText;
      }
      if (!desc && currentItem.querySelector('.portfolio-info p')) {
        desc = currentItem.querySelector('.portfolio-info p').innerText;
      }
      lightboxTitle.innerText = title || '';
      lightboxDesc.innerText = desc || '';
    }
    
    showArrowsTemporarily();
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.hero-item, .lightbox-trigger');
    if (trigger && (trigger.querySelector('img') || trigger.querySelector('video'))) {
      // Trova il contenitore genitore più vicino che raggruppa questa categoria
      const container = trigger.closest('.gallery-category-group, .sections-scroll-wrapper, .plan-item, .gallery-grid, .gallery-grid-mobile, .project-gallery, .project-split-mobile, .project-split, .portfolio-grid, .hero-section');
      if (container) {
          visibleImages = Array.from(container.querySelectorAll('.hero-item, .lightbox-trigger')).filter(el => el.offsetParent !== null);
      } else {
          visibleImages = Array.from(document.querySelectorAll('.hero-item, .lightbox-trigger')).filter(el => el.offsetParent !== null);
      }
      currentIndex = visibleImages.indexOf(trigger);
      if (currentIndex === -1) currentIndex = 0;
      
      if (lightboxText && lightboxMore) {
        lightboxText.classList.remove('show');
        lightboxMore.innerText = 'Scopri di più';
      }

      updateLightboxContent();
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      if (visibleImages.length > 1) {
          prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
          nextBtn.style.display = currentIndex < visibleImages.length - 1 ? 'block' : 'none';
      } else {
          prevBtn.style.display = 'none';
          nextBtn.style.display = 'none';
      }
    }
  });

  function goPrev() {
    if(visibleImages.length <= 1 || currentIndex === 0) return;
    currentIndex--;
    updateLightboxContent();
    // Update button visibility manually here since click might not trigger open logic
    prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
    nextBtn.style.display = currentIndex < visibleImages.length - 1 ? 'block' : 'none';
  }

  function goNext() {
    if(visibleImages.length <= 1 || currentIndex === visibleImages.length - 1) return;
    currentIndex++;
    updateLightboxContent();
    // Update button visibility manually
    prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
    nextBtn.style.display = currentIndex < visibleImages.length - 1 ? 'block' : 'none';
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goPrev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goNext();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
  });

  let touchStartX = 0;
  let touchEndX = 0;
  
    // Aggiunta pulsante Lente
  let lensToggleBtn = document.getElementById('lightbox-lens-toggle');
  if (lightbox && !lensToggleBtn) {
      lensToggleBtn = document.createElement('button');
      lensToggleBtn.id = 'lightbox-lens-toggle';
      lensToggleBtn.className = 'lens-toggle-btn';
      lensToggleBtn.innerHTML = '<span class="lens-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-burgundy)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span><span class="lens-text">Esplora dettagli</span>';
      lightbox.querySelector('.lightbox-content').appendChild(lensToggleBtn);
      
      window.isLensActive = false;
      lensToggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.isLensActive = !window.isLensActive;
          if (window.isLensActive) {
              lensToggleBtn.classList.add('active');
          } else {
              lensToggleBtn.classList.remove('active');
              const glass = document.querySelector(".img-magnifier-glass");
              if (glass) glass.style.display = "none";
          }
      });
  }


  if (lightbox) {
      lightbox.addEventListener('touchstart', e => {
          if (!window.isLensActive) {
              touchStartX = e.changedTouches[0].screenX;
          }
      }, {passive: true});
      lightbox.addEventListener('touchend', e => {
          if (!window.isLensActive) {
              touchEndX = e.changedTouches[0].screenX;
              if (touchEndX < touchStartX - 50) goNext();
              if (touchEndX > touchStartX + 50) goPrev();
          }
      }, {passive: true});
  }
  // --- FINE NUOVA LOGICA ---

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

  // Chiudi lightbox
  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      
      // Reset logic for next open
      if (lightboxText && lightboxMore) {
        lightboxText.classList.remove('show');
        lightboxMore.innerText = 'Scopri di più';
      }
      if(lightboxImg) {
        lightboxImg.classList.remove('zoomed');
      }
    });
  };

  const closeLightbox = () => {
    if(lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
      if(lightboxVideo) {
        lightboxVideo.src = '';
      }
      if(lightboxImg) {
        lightboxImg.classList.remove('zoomed');
      }
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

  // Creazione della lente di ingrandimento
  const glass = document.createElement("div");
  glass.className = "img-magnifier-glass";
  document.body.appendChild(glass);

  if(lightboxImg) {
    // Al click sull'immagine, non facciamo nulla oppure potremmo chiudere la lightbox
    lightboxImg.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    lightboxImg.addEventListener("mouseenter", () => {
      if (window.innerWidth <= 992) return;
      glass.style.display = "block";
      glass.style.backgroundImage = "url('" + lightboxImg.src + "')";
      
      const rect = lightboxImg.getBoundingClientRect();
      const zoomLevel = 1.8; // Abbassato ulteriormente per maggiore leggibilità del contesto
      glass.style.backgroundSize = (rect.width * zoomLevel) + "px " + (rect.height * zoomLevel) + "px";
    });

    lightboxImg.addEventListener("mouseleave", () => {
      if (window.innerWidth <= 992) return;
      glass.style.display = "none";
    });

    lightboxImg.addEventListener("mousemove", (e) => {
      if (window.innerWidth <= 992) return;
      e.preventDefault();
      
      const rect = lightboxImg.getBoundingClientRect();
      const zoomLevel = 1.8; // Deve coincidere
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const bgX = (x * zoomLevel) - (glass.offsetWidth / 2);
      const bgY = (y * zoomLevel) - (glass.offsetHeight / 2);

      glass.style.backgroundPosition = "-" + bgX + "px -" + bgY + "px";
      glass.style.left = (e.clientX - glass.offsetWidth / 2) + "px";
      glass.style.top = (e.clientY - glass.offsetHeight / 2) + "px";
    });

    // Touch support for Magnifier
    lightboxImg.addEventListener("touchstart", (e) => {
      if (window.isLensActive) {
          glass.style.display = "block";
          glass.style.backgroundImage = "url('" + lightboxImg.src + "')";
          const rect = lightboxImg.getBoundingClientRect();
          glass.style.backgroundSize = (rect.width * 1.8) + "px " + (rect.height * 1.8) + "px";
          updateTouchMagnifier(e.touches[0]);
      }
    }, {passive: true});

    lightboxImg.addEventListener("touchmove", (e) => {
      if (window.isLensActive) {
          updateTouchMagnifier(e.touches[0]);
      }
    }, {passive: true});

    lightboxImg.addEventListener("touchend", () => {
      if (window.isLensActive) {
          glass.style.display = "none";
      }
    });

    function updateTouchMagnifier(touch) {
      if(!glass || glass.style.display === "none") return;
      const rect = lightboxImg.getBoundingClientRect();
      const zoomLevel = 1.8;
      
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const bgX = (x * zoomLevel) - (glass.offsetWidth / 2);
      const bgY = (y * zoomLevel) - (glass.offsetHeight / 2);

      glass.style.backgroundPosition = "-" + bgX + "px -" + bgY + "px";
      
      // Fix posizionamento per non coprire il dito (offset Y)
      let offset_y = 0;
      if (window.innerWidth <= 992) {
          offset_y = 80; // Sostituisce il translate CSS per massima compatibilità
      }
      
      glass.style.left = (touch.clientX - glass.offsetWidth / 2) + "px";
      glass.style.top = (touch.clientY - glass.offsetHeight / 2 - offset_y) + "px";
    }
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

    // Controlla in tempo reale se il cursore  sopra un'immagine interattiva
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

  // Se  un dispositivo puramente touch, il cursore non si muoverà mai e rimarrà invisibile.
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
      'interior': { title: 'Interior Design', desc: "Progettiamo spazi cuciti su misura per te. Che tu preferisca linee morbide e avvolgenti o geometrie più pulite, il nostro obiettivo è trovare sempre la perfetta armonia visiva, creando ambienti in cui ti sentirai a casa.", img: 'assets/home-interior_png.webp' },
      'product': { title: 'Product Design', desc: "Dalla singola seduta al complemento d'arredo, studiamo ogni dettaglio per dare forma a oggetti pratici e senza tempo. Il nostro approccio si distingue per l'assenza di spigoli visivi, privilegiando la fluidità e l'armonia.", img: 'assets/Image8_png.webp', pos: 'center 70%' },
      'exhibit': { title: 'Exhibit Design', desc: "Esperienze immersive e scenografie che guidano il visitatore in un percorso sensoriale fatto di forme e atmosfera. Ogni allestimento è una messa in scena poetica, dove il prodotto o l'opera d'arte trovano la loro casa temporanea in un guscio di pura emozione.", img: 'assets/exhibit-1_jpg.webp' },
      'outdoor': { title: 'Outdoor', desc: "Il dialogo costante tra costruito e natura: giardini e terrazze diventano estensioni fluide del benessere interno. Progettare l'esterno significa creare una stanza a cielo aperto dove la natura non viene domata, ma accolta in un abbraccio continuo con lo spazio abitativo.", img: 'assets/home-outdoor_jpg.webp' }
    };

    
    const updateNavTheme = (filter) => {
      const target = document.body;
      if (!target) return;
      target.classList.remove('theme-interior', 'theme-product', 'theme-exhibit', 'theme-outdoor');
      if (filter === 'interior') target.classList.add('theme-interior');
      else if (filter === 'product') target.classList.add('theme-product');
      else if (filter === 'exhibit') target.classList.add('theme-exhibit');
      else if (filter === 'outdoor') target.classList.add('theme-outdoor');
    };

    const applyFilter = (filterValue) => {
      updateNavTheme(filterValue);

      // Gestione UI Intro Categoria
      if (portfolioFilters) portfolioFilters.style.display = 'flex'; // I filtri devono essere sempre visibili

      if (filterValue === 'all') {
        if (defaultHeader) defaultHeader.style.display = 'block';
        if (categoryHeroSection) categoryHeroSection.style.display = 'none';
        portfolioSection.classList.remove('has-hero'); // Ripristina il padding per mostrare correttamente il titolo
      } else {
        if (defaultHeader) defaultHeader.style.display = 'none';
        
        if (categoryHeroSection && categoryData[filterValue]) {
          catHeroTitle.innerText = categoryData[filterValue].title;
          catHeroDesc.innerText = categoryData[filterValue].desc;
          catHeroImg.src = categoryData[filterValue].img;
          catHeroImg.style.objectPosition = categoryData[filterValue].pos || 'center';
          categoryHeroSection.style.display = 'block';
          portfolioSection.classList.add('has-hero'); // Rimuove il padding perchéé c'è il banner sopra
        }
      }

      // Filter Projects
      let visibleCount = 0;
      portfolioItems.forEach(item => {
        const itemCategories = item.getAttribute('data-category').split(' ');
        if (filterValue === 'all' || itemCategories.includes(filterValue)) {
          item.style.display = 'block';
          
          const isMobile = window.innerWidth <= 992;
          let shouldInvert = false;
          
          if (isMobile) {
            // Mobile 2-column pattern: Normal, Inverted, Inverted, Normal
            const mod = visibleCount % 4;
            shouldInvert = (mod === 1 || mod === 2);
          } else {
            // Desktop 3-column pattern: Normal, Inverted, Normal, Inverted
            shouldInvert = (visibleCount % 2 === 1);
          }
          
          if (shouldInvert) {
            item.classList.add('arch-inverted');
          } else {
            item.classList.remove('arch-inverted');
          }
          visibleCount++;

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
    } else {
      applyFilter('all');
    }
  }
  
});



  // Touch support for dropdown menus on mobile
  const dropdownContainers = document.querySelectorAll('.dropdown-container');
  dropdownContainers.forEach(container => {
    const link = container.querySelector('a');
    if(link) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
          if (!container.classList.contains('touch-open')) {
            e.preventDefault();
            dropdownContainers.forEach(c => c.classList.remove('touch-open'));
            container.classList.add('touch-open');
          } else {
            // Force navigation on second click
            window.location.href = link.href;
          }
        }
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
      if (!e.target.closest('.dropdown-container')) {
        document.querySelectorAll('.dropdown-container').forEach(c => c.classList.remove('touch-open'));
      }
    }
  });
