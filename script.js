document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar Effect
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(11, 19, 43, 0.95)';
        navLinks.style.padding = '2rem 0';
    });

    // 3. Smooth Scrolling for Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = navbar.offsetHeight;
                window.scrollTo({
                    top: target.offsetTop - navHeight,
                    behavior: 'smooth'
                });

                // Close menu on mobile after click
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });

    // 4. Scroll Reveal Animations utilizing Intersection Observer
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Play animation only once
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 5. Form Submission y Configuración de EmailJS
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página se recargue

            // Cambiamos el texto del botón mientras se envía para dar feedback visual
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            // Recopilamos los datos ingresados por el usuario en el formulario
            const templateParams = {
                user_name: document.getElementById('name').value,
                user_email: document.getElementById('email').value,
                user_phone: document.getElementById('phone').value,
                message: document.getElementById('message').value
            };

            /*
              NOTA: Para que funcione el correo real, debes crearte una cuenta en EmailJS,
              reemplazar el PUBLIC_KEY en el index.html, y el SERVICE_ID / TEMPLATE_ID aquí:
              
              emailjs.send('TU_SERVICE_ID', 'TU_TEMPLATE_ID', templateParams)
                  .then((response) => {
                      alert(`¡Gracias ${templateParams.user_name}! Se ha enviado un correo a ${templateParams.user_email} para agendar su consulta penal.`);
                      form.reset();
                      submitBtn.textContent = originalText;
                      submitBtn.disabled = false;
                  }, (error) => {
                      alert('Hubo un error al enviar el mensaje. Intente de nuevo.');
                      submitBtn.textContent = originalText;
                      submitBtn.disabled = false;
                  });
            */

            // Simulación visual mientras no pones tus credenciales de EmailJS:
            setTimeout(() => {
                alert(`¡Gracias ${templateParams.user_name}!\nHemos enviado un correo automático a ${templateParams.user_email} con los pasos para agendar su consulta penal y procesar el enlace de pago.`);
                form.reset(); // Vacia todos los campos del formulario
                submitBtn.textContent = originalText; // Restaura el botón
                submitBtn.disabled = false;
            }, 1500); // Espera 1.5 segundos simulando tiempo de carga de internet
        });
    }

    // 6. Base de Datos Simulada para Pagos (Webpay LocalStorage)
    // NOTA DE DESARROLLO: Todo el bloque siguiente ha sido comentado para 
    // la versión de comercialización que utilizará un link de pago real (Flow/Webpay).

    /*
    const btnGenerarToken = document.getElementById('btnGenerarToken');
    const simulacionPago = document.getElementById('simulacionPago');
    const tokenDisplay = document.getElementById('tokenDisplay');
    const btnPagarToken = document.getElementById('btnPagarToken');
    const tablaTokensBody = document.getElementById('tablaTokensBody');
    const btnLimpiarBD = document.getElementById('btnLimpiarBD');

    let currentToken = null; // Variable para almacenar el token que se está pagando

    // Función para obtener los tokens guardados en el navegador (Base de datos simulada)
    function getTokensFromDB() {
        // localStorage guarda datos de forma persistente en el navegador como texto (String)
        const tokens = localStorage.getItem('rodens_abogado_tokens');
        // Si hay datos, los convierte de texto (JSON) a un objeto/arreglo de JavaScript. Si no, devuelve un arreglo vacío [].
        return tokens ? JSON.parse(tokens) : [];
    }

    // Función para guardar los tokens en el navegador
    function saveTokensToDB(tokensArray) {
        // Convierte el arreglo JavaScript a texto (JSON) y lo guarda en localStorage
        localStorage.setItem('rodens_abogado_tokens', JSON.stringify(tokensArray));
    }

    // Función para visualizar los datos en la tabla HTML
    function renderTable() {
        const tokens = getTokensFromDB();
        if(!tablaTokensBody) return;
        
        tablaTokensBody.innerHTML = ''; // Limpia la tabla antes de volver a dibujar

        if (tokens.length === 0) {
            tablaTokensBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 1rem; color: var(--text-muted);">No hay registros de pago en la base de datos.</td></tr>';
            return;
        }

        // Recorre todos los tokens y crea una fila <tr> por cada uno
        tokens.forEach(tokenObj => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

            // Color de estado: Verde si está pagado, Amarillo/Naranja si está pendiente
            const statusColor = tokenObj.estado === 'Pagado' ? '#4ade80' : '#fbbf24';

            tr.innerHTML = `
                <td style="padding: 1rem; font-family: monospace;">${tokenObj.id}</td>
                <td style="padding: 1rem;">${tokenObj.fecha}</td>
                <td style="padding: 1rem;">$${tokenObj.monto.toLocaleString('es-CL')} CLP</td>
                <td style="padding: 1rem;">
                    <span style="background: rgba(255,255,255,0.1); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; color: ${statusColor}; border: 1px solid ${statusColor};">
                        ${tokenObj.estado}
                    </span>
                </td>
            `;
            tablaTokensBody.appendChild(tr);
        });
    }

    // Evento: Al hacer clic en "Generar Token"
    if (btnGenerarToken) {
        btnGenerarToken.addEventListener('click', () => {
            // Genera un ID aleatorio simulando un código de Webpay (ej. WP-4A9B2)
            const randomId = 'WP-' + Math.random().toString(36).substring(2, 8).toUpperCase();

            // Objeto que representa el registro en nuestra Base de Datos
            const nuevoToken = {
                id: randomId,
                fecha: new Date().toLocaleString('es-CL'),
                monto: 50000, // Valor fijo de la consulta para el ejemplo
                estado: 'Pendiente' // Se crea pendiente de pago
            };

            // Trae los datos antiguos, agrega el nuevo, y vuelve a guardar
            const dbTokens = getTokensFromDB();
            dbTokens.push(nuevoToken);
            saveTokensToDB(dbTokens);

            // Muestra el token visualmente para pagarlo
            currentToken = randomId;
            tokenDisplay.textContent = randomId;
            simulacionPago.style.display = 'block';
            btnGenerarToken.style.display = 'none';

            // Actualiza la tabla visualmente
            renderTable();
        });
    }

    // Evento: Al hacer clic en "Simular Pago"
    if (btnPagarToken) {
        btnPagarToken.addEventListener('click', () => {
            if (!currentToken) return;

            // Trae la base de datos actual
            const dbTokens = getTokensFromDB();
            
            // Busca el token actual y le cambia el estado a "Pagado"
            const updatedTokens = dbTokens.map(t => {
                if (t.id === currentToken) {
                    return { ...t, estado: 'Pagado' };
                }
                return t;
            });

            // Guarda la actualización en la base de datos
            saveTokensToDB(updatedTokens);
            
            alert(\`¡Pago exitoso para el token \${currentToken}!\`);
            
            // Restaura la vista
            simulacionPago.style.display = 'none';
            btnGenerarToken.style.display = 'inline-flex';
            currentToken = null;

            // Actualiza la tabla visual
            renderTable();
        });
    }

    // Limpiar base de datos (para pruebas)
    if (btnLimpiarBD) {
        btnLimpiarBD.addEventListener('click', () => {
            if (confirm('¿Seguro que desea borrar todos los registros simulados?')) {
                localStorage.removeItem('rodens_abogado_tokens');
                renderTable();
            }
        });
    }

    // Dibujar la tabla por primera vez al cargar la página
    renderTable();
    */
});
