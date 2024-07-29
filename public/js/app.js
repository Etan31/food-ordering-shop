
let sidebar = document.querySelector(".sidebar");
let openBtn = document.querySelector("#burder-menu-btn");
let closeBtn = document.querySelector("#chevrons-btn");

openBtn.addEventListener("click", ()=>{
    sidebar.classList.toggle("open");
    menuBtnChange();
});

closeBtn.addEventListener("click", ()=>{ 
    sidebar.classList.toggle("open");
    menuBtnChange();
});

function menuBtnChange() {
    if(sidebar.classList.contains("open")){
        closeBtn.classList.replace("bx-chevrons-right", "bx-chevrons-left");//replacing the icon
    }else {
        closeBtn.classList.replace("bx-chevrons-left","bx-chevrons-right");//replacing the icon
    }
}

function searchmenu() {
    const searchText = document.getElementById("search-box").value.toLowerCase();
    const menuCards = document.querySelectorAll(".image");

    menuCards.forEach(card => {
        const menuName = card.querySelector("p:first-of-type").innerText.toLowerCase();
        const menuPrice = card.querySelector("p:nth-of-type(2)").innerText.toLowerCase();
        
        // Check if either menu name or menu price contains the search text
        if (menuName.includes(searchText) || menuPrice.includes(searchText)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}