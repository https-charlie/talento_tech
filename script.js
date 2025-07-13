document.addEventListener('DOMContentLoaded', () => {
    // Selectores del DOM
    const productosContainer = document.getElementById('productos-container');
    const carritoContainer = document.getElementById('carrito-container');
    const carritoContador = document.getElementById('carrito-contador');
    const carritoTotal = document.getElementById('carrito-total');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
    const formularioContacto = document.getElementById('formulario-contacto');
    const verCarritoBtn = document.getElementById('ver-carrito');
    const carritoSeccion = document.getElementById('carrito-seccion');

    // Estado del carrito
    let carrito = cargarCarrito();

    // --- CARGA DE PRODUCTOS DESDE API ---

    /**
     * Obtiene productos desde una API de prueba y los renderiza.
     */
    const fetchProductos = async () => {
        try {
            // Usamos una API de prueba para obtener productos
            const response = await fetch('https://fakestoreapi.com/products/category/electronics?limit=6');
            const productos = await response.json();
            renderizarProductos(productos);
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            productosContainer.innerHTML = '<p>No se pudieron cargar los productos. Intenta de nuevo más tarde.</p>';
        }
    };

    /**
     * Renderiza los productos en el DOM.
     * @param {Array} productos - El array de productos a mostrar.
     */
    const renderizarProductos = (productos) => {
        productosContainer.innerHTML = ''; // Limpiar contenedor
        productos.forEach(producto => {
            const productoCard = document.createElement('article');
            productoCard.className = 'producto-card';
            productoCard.innerHTML = `
                <img src="${producto.image}" alt="${producto.title}">
                <h3>${producto.title}</h3>
                <p>$${producto.price.toFixed(2)}</p>
                <button class="btn-comprar" data-id="${producto.id}" data-nombre="${producto.title}" data-precio="${producto.price}">Añadir al carrito</button>
            `;
            productosContainer.appendChild(productoCard);
        });
    };


    // --- LÓGICA DEL CARRITO DE COMPRAS ---

    /**
     * Agrega un producto al carrito de compras.
     * @param {Event} e - El evento de clic del botón.
     */
    const agregarAlCarrito = (e) => {
        if (e.target.classList.contains('btn-comprar')) {
            const id = e.target.dataset.id;
            const nombre = e.target.dataset.nombre;
            const precio = parseFloat(e.target.dataset.precio);

            const itemExistente = carrito.find(item => item.id === id);

            if (itemExistente) {
                itemExistente.cantidad++;
            } else {
                carrito.push({ id, nombre, precio, cantidad: 1 });
            }

            guardarCarrito();
            renderizarCarrito();
            alert(`"${nombre}" fue añadido al carrito.`);
        }
    };
    
    /**
     * Renderiza los productos del carrito en el DOM.
     */
    const renderizarCarrito = () => {
        carritoContainer.innerHTML = '';
        if (carrito.length === 0) {
            carritoContainer.innerHTML = '<p>El carrito está vacío.</p>';
        } else {
            carrito.forEach(item => {
                const carritoItem = document.createElement('div');
                carritoItem.className = 'carrito-item';
                carritoItem.innerHTML = `
                    <span>${item.nombre} (x${item.cantidad})</span>
                    <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
                    <div>
                        <button class="btn-cantidad" data-id="${item.id}" data-accion="restar">-</button>
                        <button class="btn-cantidad" data-id="${item.id}" data-accion="sumar">+</button>
                        <button class="btn-eliminar" data-id="${item.id}">Eliminar</button>
                    </div>
                `;
                carritoContainer.appendChild(carritoItem);
            });
        }
        actualizarContadorCarrito();
        actualizarTotalCarrito();
    };
    
    /**
     * Modifica la cantidad de un producto o lo elimina del carrito.
     * @param {Event} e - El evento de clic.
     */
    const modificarCarrito = (e) => {
        if (e.target.classList.contains('btn-cantidad')) {
            const id = e.target.dataset.id;
            const accion = e.target.dataset.accion;
            const item = carrito.find(item => item.id === id);

            if (item) {
                if (accion === 'sumar') {
                    item.cantidad++;
                } else if (accion === 'restar') {
                    item.cantidad--;
                    if (item.cantidad === 0) {
                        carrito = carrito.filter(i => i.id !== id);
                    }
                }
            }
        } else if (e.target.classList.contains('btn-eliminar')) {
            const id = e.target.dataset.id;
            carrito = carrito.filter(item => item.id !== id);
        }
        
        guardarCarrito();
        renderizarCarrito();
    };

    /**
     * Vacía todos los productos del carrito.
     */
    const vaciarCarrito = () => {
        carrito = [];
        guardarCarrito();
        renderizarCarrito();
    };
    
    const actualizarContadorCarrito = () => {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        carritoContador.textContent = totalItems;
    };

    const actualizarTotalCarrito = () => {
        const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
        carritoTotal.textContent = total.toFixed(2);
    };

    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function cargarCarrito() {
        const carritoGuardado = localStorage.getItem('carrito');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    }


    // --- VALIDACIÓN DEL FORMULARIO ---

    /**
     * Valida los campos del formulario antes de enviarlo.
     * @param {Event} e - El evento de envío del formulario.
     */
    const validarFormulario = (e) => {
        e.preventDefault(); // Prevenimos el envío por defecto

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();
        const mensajeError = document.getElementById('form-mensaje');

        if (nombre === '' || email === '' || mensaje === '') {
            mensajeError.textContent = 'Todos los campos son obligatorios.';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            mensajeError.textContent = 'Por favor, introduce un correo electrónico válido.';
            return;
        }

        mensajeError.textContent = '';
        // Si todo es válido, se envía el formulario
        e.target.submit();
    };
    
    // --- MANEJO DE EVENTOS ---
    productosContainer.addEventListener('click', agregarAlCarrito);
    vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    carritoContainer.addEventListener('click', modificarCarrito);
    formularioContacto.addEventListener('submit', validarFormulario);
    
    verCarritoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Alterna la visibilidad de la sección del carrito
        const esVisible = carritoSeccion.style.display === 'block';
        carritoSeccion.style.display = esVisible ? 'none' : 'block';
        if (!esVisible) {
             carritoSeccion.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // --- INICIALIZACIÓN ---
    fetchProductos();
    renderizarCarrito();
});