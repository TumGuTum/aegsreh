const menuBtn = document.querySelector('.menu__btn');
const menuClose = document.querySelector('.menu__close'); // кнопка крестика
const menuList = document.querySelector('.menu__list');
const menuShadow = document.querySelector('.menu--close');
// Открыть меню
menuBtn.addEventListener('click', () => {
  menuList.classList.toggle('menu__list--open');
  menuShadow.classList.toggle('menu--open');
});

// Закрыть меню
menuClose.addEventListener('click', () => {
  menuList.classList.remove('menu__list--open');
  menuShadow.classList.remove('menu--open');
});

document.addEventListener("DOMContentLoaded", function() {
  const popup = document.getElementById("agePopup");
  const btnYes = document.getElementById("ageYes");
  const btnNo = document.getElementById("ageNo");

  // Проверяем, было ли уже согласие
  if (!localStorage.getItem("ageVerified")) {
    popup.classList.add("show");
  }

  btnYes.addEventListener("click", function() {
    localStorage.setItem("ageVerified", "true");
    popup.classList.remove("show");
  });

  btnNo.addEventListener("click", function() {
    alert("Доступ запрещён. Сайт будет закрыт.");
    window.close();

    // Если браузер не разрешает закрыть вкладку:
    window.location.href = "https://google.com";
  });
});
// Скрипт корзины
document.addEventListener('DOMContentLoaded', () => {
  const cartBtn = document.getElementById('cart-btn');
  const cartPopup = document.getElementById('cart-popup');
  const cartClose = document.getElementById('cart-close');
  const cartItemsList = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const cartCountEl = document.getElementById('cart-count');
  const orderBtn = document.getElementById('order-btn');
  let cart = []; // { id, title, price, quantity }

    // Утилита: привести ценовую строку "350 ₽" или "350" или "350.50 ₽" → число
    function parsePrice(text){
      if(!text) return 0;
      // оставить цифры и запятые/точки, заменить запятую на точку
      const cleaned = String(text).replace(/[^\d.,]/g, '').replace(',', '.');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }

    // Открыть/закрыть popup
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cartPopup.classList.add('active');
      cartPopup.setAttribute('aria-hidden', 'false');
    });
    cartClose.addEventListener('click', () => {
      cartPopup.classList.remove('active');
      cartPopup.setAttribute('aria-hidden', 'true');
    });
    // Закрыть при клике по затемнению (за пределами контента)
    cartPopup.addEventListener('click', (e) => {
      if (e.target === cartPopup) {
        cartPopup.classList.remove('active');
        cartPopup.setAttribute('aria-hidden', 'true');
      }
    });

    // Добавление в корзину — на все кнопки buy-btn (поддерживаем любую структуру .card)
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('.buy-btn');
      if (!btn) return;
      // найти ближайшую карточку, которая содержит .card__title и .card__price
      const cardClosest = btn.closest('.card');
      if (!cardClosest) return;

      const titleEl = cardClosest.querySelector('.card__title');
      const priceEl = cardClosest.querySelector('.card__price');

      const title = titleEl ? titleEl.innerText.trim() : 'Товар';
      const price = priceEl ? parsePrice(priceEl.innerText) : 0;

      // используем key = title + price чтобы отличать варианты с одинаковым названием но разной ценой
      const key = title + '||' + price;

      const existing = cart.find(item => item.key === key);
      if (existing) {
        existing.quantity++;
      } else {
        cart.push({ key, title, price, quantity: 1 });
      }

      renderCart();
    });
// Отрисовка корзины
function renderCart(){
      cartItemsList.innerHTML = '';
      let total = 0;
      let totalCount = 0;

      cart.forEach((item, idx) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        totalCount += item.quantity;

        const li = document.createElement('li');
        li.dataset.index = idx;

        li.innerHTML = `
          <div class="cart-item-left">
            <div class="cart-item-title">${escapeHtml(item.title)}</div>
            <div class="cart-item-sub">${formatPrice(item.price)} ₽ x ${item.quantity} = ${formatPrice(subtotal)} ₽</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="quantity-control" data-index="${idx}">
              <button class="dec" aria-label="Уменьшить">-</button>
              <div style="min-width:22px;text-align:center">${item.quantity}</div>
              <button class="inc" aria-label="Увеличить">+</button>
            </div>
          </div>
        `;
        // кнопки +/-
        li.querySelector('.quantity-control .dec').addEventListener('click', () => {
          if (item.quantity > 1) {
            item.quantity--;
          } else {
            cart.splice(idx, 1);
          }
          renderCart();
        });
        li.querySelector('.quantity-control .inc').addEventListener('click', () => {
          item.quantity++;
          renderCart();
        });

        cartItemsList.appendChild(li);
      });

      cartTotalEl.innerText = formatPrice(total) + ' ₽';

      // обновить бейдж с количеством
      if (totalCount > 0) {
        cartCountEl.style.display = 'flex';
        cartCountEl.innerText = totalCount;
      } else {
        cartCountEl.style.display = 'none';
      }
    }

    // форматирование числа — убрать лишние 0 если целое
    function formatPrice(num){
      if (Number.isInteger(num)) return String(num);
      return String(num.toFixed(2));
    }


    // простая защита от XSS (название товара стандартно из DOM, но на всякий случай)
    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, function (m) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
      });
    }

    // Кнопка "Заказать" — пока просто пример (без оплаты)
    orderBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Корзина пуста');
        return;
      }
      // Здесь можно собрать данные и отправить на сервер
      const summary = cart.map(i => `${i.title} — ${i.quantity} шт.`).join('\n');
      alert('Заказ:\n' + summary + '\n\nИтого: ' + cartTotalEl.innerText);
      // После оформления можно очистить корзину:
      // cart = []; renderCart(); cartPopup.classList.remove('active');
    });

    // Рендер начальный
    renderCart();

  });





  document.addEventListener('DOMContentLoaded', function () {
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const desc = item.querySelector('.accordion-item-desc');

        // Initialize the max-height based on the checkbox state
        if (checkbox.checked) {
            desc.style.maxHeight = desc.scrollHeight + 'px';
        } else {
            desc.style.maxHeight = '0';
        }

        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                // Ensure smooth transition
                desc.style.transition = 'max-height 0.6s ease, padding 0.4s ease';
                desc.style.maxHeight = desc.scrollHeight + 'px';
            } else {
                // Ensure smooth transition
                desc.style.transition = 'max-height 0.6s ease, padding 0.6s ease';
                desc.style.maxHeight = '0';
            }
        });

        // Observe changes in the content and adjust max-height accordingly
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (checkbox.checked) {
                    desc.style.maxHeight = desc.scrollHeight + 'px';
                }
            }
        });

        observer.observe(desc);
    });
});



// скролл 
const track = document.querySelector(".scroll-track");
let lastScrollY = window.scrollY;
let scrollSpeed = 0;
let position = 0;

function animate() {
  position += scrollSpeed;

  // бесконечный цикл — плавный переход без видимых швов
  const width = track.scrollWidth / 3;
  if (position > width) position = 0;
  if (position < 0) position = width;

  track.style.transform = `translateX(${-position}px)`;
  scrollSpeed *= 0.95; // плавное замедление
  requestAnimationFrame(animate);
}

window.addEventListener("scroll", () => {
  const newY = window.scrollY;
  scrollSpeed += (newY - lastScrollY) * 0.03;
  lastScrollY = newY;
});

animate();




const slidesContainer = document.querySelector('.news-section__slides');
const slides = document.querySelectorAll('.news-section__slides img');
const dots = document.querySelectorAll('.dot');
let currentIndex = 0;

// --- Переключение слайдов ---
function goToSlide(index) {
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  slidesContainer.scrollTo({
    left: index * slidesContainer.clientWidth,
    behavior: 'smooth'
  });
  currentIndex = index;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
}

// --- Свайп мышью ---
let isDown = false;
let startX;
let scrollLeft;

slidesContainer.addEventListener('mousedown', e => {
  isDown = true;
  startX = e.pageX - slidesContainer.offsetLeft;
  scrollLeft = slidesContainer.scrollLeft;
});
slidesContainer.addEventListener('mouseleave', () => isDown = false);
slidesContainer.addEventListener('mouseup', () => isDown = false);
slidesContainer.addEventListener('mousemove', e => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slidesContainer.offsetLeft;
  const walk = (x - startX) * 1.2;
  slidesContainer.scrollLeft = scrollLeft - walk;
});

// --- Свайп пальцем ---
let touchStartX = 0;
slidesContainer.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
});
slidesContainer.addEventListener('touchend', e => {
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) goToSlide(currentIndex + 1);
    else goToSlide(currentIndex - 1);
  }
});

// --- Клик по левой / правой части картинки ---
slidesContainer.addEventListener('click', e => {
  const clickX = e.offsetX;
  const half = slidesContainer.clientWidth / 2;
  if (clickX > half) {
    goToSlide(currentIndex + 1);
  } else {
    goToSlide(currentIndex - 1);
  }
});

// --- Обновление точки при скролле ---
slidesContainer.addEventListener('scroll', () => {
  const index = Math.round(slidesContainer.scrollLeft / slidesContainer.clientWidth);
  if (index !== currentIndex) {
    currentIndex = index;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }
});



$('.sms-form').on('submit', function (event) {

    event.stopPropagation();
    event.preventDefault();

    let form = this,
        submit = $('.submit', form),
        data = new FormData(),
        files = $('input[type=file]')


    $('.submit', form).val('Отправка...');
    $('input, textarea', form).attr('disabled','');

    data.append( 'name', 		$('[name="name"]', form).val() );

   

    files.each(function (key, file) {
        let cont = file.files;
        if ( cont ) {
            $.each( cont, function( key, value ) {
                data.append( key, value );
            });
        }
    });
    
    $.ajax({
        url: 'ajax.php',
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false,
        xhr: function() {
            let myXhr = $.ajaxSettings.xhr();

            if ( myXhr.upload ) {
                myXhr.upload.addEventListener( 'progress', function(e) {
                    if ( e.lengthComputable ) {
                        let percentage = ( e.loaded / e.total ) * 100;
                            percentage = percentage.toFixed(0);
                        $('.submit', form)
                            .html( percentage + '%' );
                    }
                }, false );
            }

            return myXhr;
        },
        error: function( jqXHR, textStatus ) {
            // Тут выводим ошибку
        },
        complete: function() {
            // Тут можем что-то делать ПОСЛЕ успешной отправки формы
            console.log('Complete')
            form.reset() 
        }
    });

    return false;
});
$('.sms-form').on('submit', function (event) {

  event.stopPropagation();
  event.preventDefault();

  let form = this,
      submit = $('.submit', form),
      data = new FormData(),
      files = $('input[type=file]')


  $('.submit', form).val('Отправка...');
  $('input, textarea', form).attr('disabled','');

  data.append( 'name', 		$('[name="name"]', form).val() );

 

  files.each(function (key, file) {
      let cont = file.files;
      if ( cont ) {
          $.each( cont, function( key, value ) {
              data.append( key, value );
          });
      }
  });
  
  $.ajax({
      url: 'ajax.php',
      type: 'POST',
      data: data,
      cache: false,
      dataType: 'json',
      processData: false,
      contentType: false,
      xhr: function() {
          let myXhr = $.ajaxSettings.xhr();

          if ( myXhr.upload ) {
              myXhr.upload.addEventListener( 'progress', function(e) {
                  if ( e.lengthComputable ) {
                      let percentage = ( e.loaded / e.total ) * 100;
                          percentage = percentage.toFixed(0);
                      $('.submit', form)
                          .html( percentage + '%' );
                  }
              }, false );
          }

          return myXhr;
      },
      error: function( jqXHR, textStatus ) {
          // Тут выводим ошибку
      },
      complete: function() {
          // Тут можем что-то делать ПОСЛЕ успешной отправки формы
          console.log('Complete')
          form.reset() 
      }
  });

  return false;
});




document.addEventListener('DOMContentLoaded', function () {
  // Создаем карту
  const map = L.map('map', {scrollWheelZoom: false}).setView([46.85, 29.65], 10);

  // Загружаем тайлы
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Полигон Приднестровья
  L.polygon([
    [47.005, 29.493],
    [46.986, 30.074],
    [46.659, 30.121],
    [46.626, 29.516],
    [46.775, 29.457],
    [47.005, 29.493]
  ], {color:'#ff7800', fillColor:'#ffa500', fillOpacity:0.3}).addTo(map);

  // Маркер в центре
  L.marker([46.85, 29.65]).addTo(map).bindPopup('Приднестровье').openPopup();
});


document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");

  // создаём "пустышку", чтобы контент не подпрыгивал
  const placeholder = document.createElement("div");
  placeholder.style.height = header.offsetHeight + "px";
  header.parentNode.insertBefore(placeholder, header.nextSibling);

  // закрепляем хедер через JS
  header.style.position = "fixed";
  header.style.top = "0";
  header.style.left = "0";
  header.style.width = "100%";
  header.style.zIndex = "9999";
  header.style.backgroundColor = "rgba(20, 20, 20, 0.9)";
  header.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
});




















