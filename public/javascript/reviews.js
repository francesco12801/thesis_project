//prendo la lista dei locali preferiti
fetch('/profile/list')
.then(response => response.json())
.then(data => {
    console.log(data);
    // var done = fetch('/review/list')
    .then(response => response.json())
    .then
    //aggiungere le opzioni alla selection
    var selection = document.getElementById('locale');
    var option;

    for (var i = 0; i < data.length; i++){
        option = createHTML(`
        <option value="${data[i].title}">${data[i].title}</option>
        `);
        selection.appendChild(option)
    }
})
 .catch(error => console.error(error));
 

 
function createHTML (html){
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}