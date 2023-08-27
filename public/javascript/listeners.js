function handlePopUp(){
    const container = document.getElementById("popup-container");
    if (!container.style.display || container.style.display == "none")
        container.style.display = "flex";
    else container.style.display = "none";
}

function deletePopUp(){
    document.getElementById("popup-container").style.display = "none";
    fetch("/users/deleteProfile",  {
        method: 'POST',
    });
    window.open("/","_self");
    return;
}

function friendsPopUp(){
    const popup = document.getElementById("popup-friends");
    const button = document.getElementById("openPopup");
    if (!popup.style.display || popup.style.display == "none"){
        popup.style.display = "flex";
        button.classList.add('hidden');
    }
    else {
        popup.style.display = "none";
        button.style.display = "visible";
    }
}

function moveNav() {
    var sidebar = document.getElementById("mySideBar");
    var sidebarWidth = sidebar.style.width;
    console.log("0 ");
    if ($(window).width() >= 768){
      console.log("1 ");
      if (sidebarWidth === '250px') {
          sidebar.style.width = "0";
          sidebar.style.display = "none";
      }else {
          sidebar.style.width = "250px";
          sidebar.style.display = "block";
      } 
    }
    }

function logOut(){
    fetch("/logout", {
        method: 'POST',
    }
    );
    window.open("/","_self");
    return;
}

document.addEventListener("DOMContentLoaded", function() {
    const popupButton = document.getElementById("popup-button");
    const popup = document.getElementById("post-popup");
    const closePopup = document.getElementById("close-popup");
    const popupTextarea = document.getElementById("popup-textarea");
    
      
    popupButton.addEventListener("click", () => {
        if (popup.style.display == "none")
            popup.style.display = "block";
        else popup.style.display == "none"
    });
      
    closePopup.addEventListener("click", () => {
        popup.style.display = "none";
    });
    
    window.addEventListener("click", (event) => {
        if (event.target === popup) {
        popup.style.display = "none";
        }
    });
    
    });