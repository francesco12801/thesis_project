
// CREAZIONE POST
fetch('/get_post')
.then(response => response.json())
.then(async data => {
    console.log(data);
    var container = document.getElementById('post-container');
    var post;
    var heart_id;
    var heart_map = new Map();
    var className;

    const response = await fetch('/post/get_like');
    const like_list = await response.json();
    console.log(like_list);

    for (var i = 0; i < data.length; i++){
        var filter = like_list.filter((function(n) {return n.post_id == i}));
        if (filter.length > 0) className = 'fa-solid fa-heart';
        else className = 'fa-regular fa-heart';
        heart_id = 'heart' + data[i].id;
        post = createHTML(`
                        <div class="post">
                            <h3>${data[i].username}</h3>
                            <p>${data[i].text}</p>
                            <i class="${className}" id='${heart_id}' style="position: relative;"></i>
                       </div>
        `);
        container.appendChild(post);

    }
    //TODO salvare like, cambiare classe del cuore
    for (var i = 0; i < data.length; i++){
        (function(index) {
            document.getElementById('heart'+i).addEventListener('click', function() {
                hrt = document.getElementById('heart'+index);
                fetch('/posts/${index}/like', {
                    method: 'PUT'
                });
                return;
            });
        });
    }

});


function createHTML (html){
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}