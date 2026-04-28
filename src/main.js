import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

document.querySelector('#app').innerHTML = `
  <div class="container mt-5">
    <h1>RSS агрегатор</h1>
    <p>Начните читать RSS сегодня. Это легко, это красиво</p>
    <form class="mb-3 d-flex gap-3">
    <input class="form-control" type="text" id="link" name="link" value="" placeholder="Ссылка RSS">
    <label class="form-label" for="link"></label>
    <button type="button" class="btn btn-secondary">Добавить</button>
    </form>
    <p class="text-secondary">Пример: <a class="text-secondary" href="https://lorem-rss.hexlet.app/feed">https://lorem-rss.hexlet.app/feed</a></p>
  </div>`

document.body.className = 'bg-dark text-white'