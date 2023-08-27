fetch('/review/list')
.then(response => response.json())
.then(data => {
    var box_rev = document.getElementById('container-reviews-grid');
    var card;

    var bin_map = new Map();

    for (var i = 0; i < data.length; i++) {
        var id = "bin" + i;
        card = createHTML(`
        <div id='reviews-post'>
            <h1 class="box-title">${data[i].title}</h1>
            <h3 class="box-subtle">${data[i].username}</h3>
            <p class="box-text">${data[i].rev}</p>
            <i onclick="binClick()" type="submit" class="fas fa-trash" id="${id}" style="color: black;" ></i>
        </div>
        `);
        bin_map.set(id,{
            title: data[i].title,
            username: data[i].username,
        });
        box_rev.appendChild(card);
    }
    //aggiungo listener
    for (var i = 0; i < bin_map.size; i++){
        (function (index) {
            document.getElementById('bin'+i).addEventListener('click', function() {
                bn = document.getElementById('bin'+index);
                var params = {
                    card: bin_map.get('bin'+index),
                    }
                fetch('/review/list/update', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(params)
                });
                return;
            })
        })(i);
        
    }

})
.catch(error => console.error(error));

function binClick(){
    window.open("/users/profile","_self");
}

function createHTML (html){
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }