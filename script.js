// Данные
let users = JSON.parse(localStorage.getItem('users')) || [];
let requests = JSON.parse(localStorage.getItem('requests')) || [];
let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
let currentUser = localStorage.getItem('currentUser') || null;
// Тестовые пользователи
if (users.length === 0) {
    users = [
        { login: 'user123', password: '123456', email: 'user@mail.ru', fio: 'Иванов Иван Иванович', tel: '8(912)345-67-89' },
        { login: 'Admin', password: 'KorokNET', email: 'admin@mail.ru', fio: 'Администратор', tel: '8(999)999-99-99' }
    ];
    localStorage.setItem('users', JSON.stringify(users));
}
// Тестовые заявки
if (requests.length === 0) {
    requests = [
        { id: 1, user: 'user123', course: 'Веб-разработка', start_date: '2026-08-01', payment: 'наличные', status: 'Новая' },
        { id: 2, user: 'user123', course: 'Python для начинающих', start_date: '2026-09-10', payment: 'перевод', status: 'Идет обучение' },
        { id: 3, user: 'user123', course: 'Дизайн интерфейсов', start_date: '2026-07-15', payment: 'наличные', status: 'Обучение завершено' }
    ];
    localStorage.setItem('requests', JSON.stringify(requests));
}
// ===== СЛАЙДЕР =====
let slideIndex = 0;
function initSlider() {
    let slides = document.querySelectorAll('.slider-slide');
    let dots = document.querySelectorAll('#dots button');
    let track = document.getElementById('sliderTrack');
    if (!track || slides.length === 0) return;
    function goTo(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        slideIndex = index;
        track.style.transform = 'translateX(-' + (slideIndex * 100) + '%)';
        dots.forEach(function(d, i) {
            d.className = (i === slideIndex) ? 'active' : '';
        });
    }
    window.nextSlide = function() { goTo(slideIndex + 1); };
    window.prevSlide = function() { goTo(slideIndex - 1); };
    dots.forEach(function(d, i) {
        d.onclick = function() {
            goTo(i);
            clearInterval(auto);
            auto = setInterval(nextSlide, 4000);
        };
    });
    let auto = setInterval(nextSlide, 4000);
    let slider = document.getElementById('slider');
    if (slider) {
        slider.onmouseenter = function() { clearInterval(auto); };
        slider.onmouseleave = function() { auto = setInterval(nextSlide, 4000); };
    }
}
// ===== АВТОРИЗАЦИЯ =====
function handleAuth(e) {
    e.preventDefault();
    let login = document.getElementById('authLogin').value.trim();
    let pass = document.getElementById('authPass').value.trim();
    let err = document.getElementById('authError');
    let suc = document.getElementById('authSuccess');
    let user = users.find(u => u.login === login && u.password === pass);
    if (user) {
        currentUser = login;
        localStorage.setItem('currentUser', currentUser);
        err.style.display = 'none';
        suc.style.display = 'block';
        suc.textContent = 'Вход выполнен!';
        setTimeout(function() {
            window.location.href = (login === 'Admin') ? 'admin.html' : 'account.html';
        }, 800);
    } else {
        err.style.display = 'block';
        err.textContent = 'Неверный логин или пароль!';
        suc.style.display = 'none';
    }
    return false;
}
// ===== РЕГИСТРАЦИЯ =====
function handleRegister(e) {
    e.preventDefault();
    let email = document.getElementById('regEmail').value.trim();
    let login = document.getElementById('regLogin').value.trim();
    let pass = document.getElementById('regPass').value.trim();
    let fio = document.getElementById('regFio').value.trim();
    let tel = document.getElementById('regTel').value.trim();
    let err = document.getElementById('regError');
    let suc = document.getElementById('regSuccess')
    let errors = [];
    if (!email || !email.includes('@')) errors.push('Неверный email');
    if (!login || login.length < 6 || !/^[A-Za-z0-9]+$/.test(login)) errors.push('Логин: латиница и цифры, ≥6');
    if (!pass || pass.length < 8) errors.push('Пароль ≥8 символов');
    if (!fio || !/^[а-яА-Я\s]+$/.test(fio)) errors.push('ФИО: только кириллица');
    if (!tel || !/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(tel)) errors.push('Телефон: 8(XXX)XXX-XX-XX');
    if (users.find(u => u.login === login)) errors.push('Логин занят');
    if (errors.length === 0) {
        users.push({ login, password: pass, email, fio, tel });
        localStorage.setItem('users', JSON.stringify(users));
        err.style.display = 'none';
        suc.style.display = 'block';
        suc.textContent = 'Регистрация успешна!';
        setTimeout(function() { window.location.href = 'auth.html'; }, 1000);
    } else {
        err.style.display = 'block';
        err.textContent = errors.join('; ');
        suc.style.display = 'none';
    }
    return false;
}
// ===== ЗАЯВКИ =====
function addRequest(e) {
    e.preventDefault();
    let course = document.getElementById('courseName').value.trim();
    let date = document.getElementById('startDate').value;
    let payment = document.getElementById('paymentMethod').value;
    let msg = document.getElementById('requestMsg');
    if (!course || !date) {
        msg.style.display = 'block';
        msg.className = 'alert alert-danger';
        msg.textContent = 'Заполните все поля!';
        return false;
    }
    let newId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
    requests.push({ id: newId, user: currentUser, course, start_date: date, payment, status: 'Новая' });
    localStorage.setItem('requests', JSON.stringify(requests));
    msg.style.display = 'block';
    msg.className = 'alert alert-success';
    msg.textContent = 'Заявка отправлена!';
    setTimeout(function() { window.location.href = 'account.html'; }, 1500);
    return false;
}
// ===== ОТОБРАЖЕНИЕ ЗАЯВОК =====
function renderRequests() {
    let container = document.getElementById('requestsList');
    if (!container) return;
    let userRequests = requests.filter(r => r.user === currentUser);
    if (userRequests.length === 0) {
        container.innerHTML = '<div class="empty">У вас пока нет заявок</div>';
        return;
    }
    let html = '';
    userRequests.forEach(function(r) {
        let cls = r.status === 'Новая' ? 'status-new' : (r.status === 'Идет обучение' ? 'status-progress' : 'status-done');
        let fb = feedbacks.find(f => f.user === currentUser && f.course === r.course);
        let fbHtml = fb ? '<div class="request-feedback">Ваш отзыв: "' + fb.text + '"</div>' : '';
        html += '<div class="request-item">' +
            '<div class="course">' + r.course + '</div>' +
            '<div class="meta">Дата: ' + r.start_date + ' | Оплата: ' + r.payment + '</div>' +
            '<span class="status ' + cls + '">' + r.status + '</span>' +
            fbHtml +
            '</div>';
    });
    container.innerHTML = html;
    updateFeedbackCourses();
}
// ===== ОБНОВЛЕНИЕ СПИСКА КУРСОВ ДЛЯ ОТЗЫВА =====
function updateFeedbackCourses() {
    let select = document.getElementById('feedbackCourse');
    if (!select) return;
    let userRequests = requests.filter(r => r.user === currentUser);
    let val = select.value;
    select.innerHTML = '<option value="">-- выберите курс --</option>';
    userRequests.forEach(function(r) {
        let has = feedbacks.some(f => f.user === currentUser && f.course === r.course);
        if (!has) {
            let opt = document.createElement('option');
            opt.value = r.course;
            opt.textContent = r.course + ' (' + r.status + ')';
            select.appendChild(opt);
        }
    });
    if (val) select.value = val;
}
// ===== ОТЗЫВ =====
function addFeedback(e) {
    e.preventDefault();
    let course = document.getElementById('feedbackCourse').value;
    let text = document.getElementById('feedbackText').value.trim();
    let msg = document.getElementById('accountMsg');
    if (!course) {
        msg.style.display = 'block';
        msg.className = 'alert alert-danger';
        msg.textContent = 'Выберите курс!';
        return false;
    }
    if (!text) {
        msg.style.display = 'block';
        msg.className = 'alert alert-danger';
        msg.textContent = 'Введите текст отзыва!';
        return false;
    }
    if (feedbacks.find(f => f.user === currentUser && f.course === course)) {
        msg.style.display = 'block';
        msg.className = 'alert alert-danger';
        msg.textContent = 'Вы уже оставили отзыв на этот курс!';
        return false;
    }
    let newId = feedbacks.length > 0 ? Math.max(...feedbacks.map(f => f.id)) + 1 : 1;
    feedbacks.push({ id: newId, user: currentUser, course, text, date: new Date().toLocaleString() });
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    msg.style.display = 'block';
    msg.className = 'alert alert-success';
    msg.textContent = 'Спасибо за отзыв на курс "' + course + '"!';
    setTimeout(function() { msg.style.display = 'none'; }, 3000);
    document.getElementById('feedbackForm').reset();
    renderRequests();
    return false;
}
// ===== АДМИНКА =====
function renderAdminRequests(filter) {
    let container = document.getElementById('adminRequestsList');
    if (!container) return;

    let filtered = filter && filter !== 'all' ? requests.filter(r => r.status === filter) : requests;
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty">Заявок нет</div>';
        return;
    }
    let html = '';
    filtered.forEach(function(r) {
        let cls = r.status === 'Новая' ? 'status-new' : (r.status === 'Идет обучение' ? 'status-progress' : 'status-done');
        let actions = '';
        if (r.status === 'Новая') {
            actions = '<div class="actions">' +
                '<a href="#" class="btn btn-success btn-sm" onclick="changeStatus(' + r.id + ', \'Идет обучение\')">Идет обучение</a>' +
                '<a href="#" class="btn btn-danger btn-sm" onclick="changeStatus(' + r.id + ', \'Обучение завершено\')">Обучение завершено</a>' +
                '</div>';
        } else if (r.status === 'Идет обучение') {
            actions = '<div class="actions">' +
                '<a href="#" class="btn btn-success btn-sm" onclick="changeStatus(' + r.id + ', \'Обучение завершено\')">Обучение завершено</a>' +
                '</div>';
        }
        html += '<div class="request-item">' +
            '<div class="course">' + r.course + '</div>' +
            '<div class="meta">Заявитель: ' + r.user + ' | Дата: ' + r.start_date + ' | Оплата: ' + r.payment + '</div>' +
            '<span class="status ' + cls + '">' + r.status + '</span>' +
            actions +
            '</div>';
    });
    container.innerHTML = html;
}
function changeStatus(id, newStatus) {
    let req = requests.find(r => r.id === id);
    if (req) {
        req.status = newStatus;
        localStorage.setItem('requests', JSON.stringify(requests));
        let active = document.querySelector('.filter-group .active');
        renderAdminRequests(active ? active.dataset.filter : 'all');
    }
}
function filterRequests(filter, el) {
    document.querySelectorAll('.filter-group a').forEach(function(a) { a.classList.remove('active'); });
    el.classList.add('active');
    renderAdminRequests(filter);
}
// ===== ВЫХОД =====
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'index.html';
}
// ===== ЗАГРУЗКА =====
document.addEventListener('DOMContentLoaded', function() {
    initSlider();
    let page = window.location.pathname.split('/').pop();
    if (page === 'account.html' || page === 'admin.html') {
        if (!currentUser) { window.location.href = 'auth.html'; return; }
        if (page === 'admin.html' && currentUser !== 'Admin') { window.location.href = 'auth.html'; return; }
        if (page === 'account.html') renderRequests();
        if (page === 'admin.html') renderAdminRequests('all');
    }
});