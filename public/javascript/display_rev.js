fetch('/review/list')
.then(response => response.json())
.then(data => {
    console.log(data);
    var box_rev = document.getElementById('container-reviews-grid');
    var card;

    for (var i = 0; i < data.length; i++) {
        card = createHTML(`
        <div id="reviews-post">
            <h1 class="box-title">${data[i].title}</h1>
            <h3 class="box-subtle">${data[i].username}</h3>
            <p class="box-text">${data[i].rev}</p>
        </div>
        `);
        box_rev.appendChild(card);
    }
})
.catch(error => console.error(error));

function createHTML (html){
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }