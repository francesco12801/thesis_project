
// CREAZIONE POST
fetch('/get_post')
.then(response => response.json())
.then(async data => {
    console.log(data);
    var container = document.getElementById('post-container');
    var post;
    var heart_id;
    var heart_map = new Map();

    const response = await fetch('/post/get_like');
    const like_list = await response.json();
    console.log(like_list);

    for (var i = 0; i < data.length; i++){
        var filter = like_list.filter((function(n) {return n.post_id == i}));
        heart_id = 'heart' + data[i].id;
        post = createHTML(`
                        <div class="post">
                            <h3>${data[i].username}</h3>
                            <p>${data[i].text}</p>
                            <i class="${filter.length > 0 ? 'fa-solid fa-heart': 'fa-regular fa-heart'}" id='${heart_id}' style="position: relative;"></i>
                       </div>
        `);
        heart_map.set(heart_id, {
            username: data[i].username,
            text: data[i].text,
            id: data[i].id
        })

        container.appendChild(post);

    }
    console.log(heart_map);
    var send_value = 1;
    for (var i = 1; i <= heart_map.size; i++){
        (function (index) {
            document.getElementById('heart'+i).addEventListener('click', function() {
                bn = document.getElementById('heart'+index);
                //vuoto -> pieno: aggiungi like e cambia classe
                if (bn.className == 'fa-regular fa-heart'){
                    bn.className = 'fa-solid fa-heart';
                    send_value = 1;
                    //aggiorna like
                    fetch(`/posts/${index}/like`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                          },
                        body: JSON.stringify({ value: send_value })
                    });
                    //aggiorna tabella like
                    fetch(`/posts/${index}/insert`, {
                        method: 'POST'
                    });
                } else {
                    send_value = -1;
                    bn.className = 'fa-regular fa-heart';
                    //aggiorna like
                    fetch(`/posts/${index}/like`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                          },
                        body: JSON.stringify({ value: send_value })
                    });
                    //aggiorna tabella like
                    fetch(`/posts/${index}/delete`, {
                        method: 'POST'
                    });
                }
                    
                return;
            })
        })(i);
    }
});


function createHTML (html){
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}