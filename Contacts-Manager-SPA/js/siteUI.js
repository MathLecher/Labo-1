//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    /*
    renderContacts();
    $('#createContact').on("click", async function () {
        saveContentScrollPosition();
        renderCreateContactForm();
    });
    $('#abort').on("click", async function () {
        renderContacts();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    */
    renderBookmarks();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de contacts</h2>
                <hr>
                <p>
                    Petite application de gestion de contacts à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2024
                </p>
            </div>
        `))
}
// PORTION MODIFIER
let selectedCategory = "";

function updateDropDownMenu(categories) {
    let DDMenu = $("#DDMenu");
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw";
    DDMenu.empty();
    DDMenu.append($(`
        <div class="dropdown-item menuItemLayout" id="allCatCmd">
             <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories
        </div>
        `));
    DDMenu.append($(`<div class="dropdown-divider"></div>`));
    categories.forEach(category => {
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw";
        DDMenu.append($(`
            <div class="dropdown-item menuItemLayout category" id="${category}">
                <i class="menuIcon fa ${selectClass} mx-2"></i> ${category}
            </div>
        `));
    })
    DDMenu.append($(`<div class="dropdown-divider"></div> `));
    DDMenu.append($(`
        <div class="dropdown-item menuItemLayout" id="aboutCmd">
            <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
        </div>
    `));
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $('#allCatCmd').on("click", function () {
        selectedCategory = "";
        renderBookmarks();
    });
    $('.category').on("click", function () {
        selectedCategory = $(this).text().trim();
        renderBookmarks(selectedCategory);
    });
}
function renderBookmark(bookmark) {
    return $(`
     <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
        <div class="bookmarkContainer noselect">
            <div class="bookmarkLayout">
                <a id="favicon" href="${bookmark.Url}"><img class="bookmarkUrl" src="http://www.google.com/s2/favicons?domain=${bookmark.Url}" alt="" title="favicon"/></a>
                <span class="bookmarkTitle">${bookmark.Title}</span>
                <span class="bookmarkCategory">${bookmark.Category}</span>
            </div>
            <div class="bookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
            </div>
        </div>
    </div>           
    `);
}

async function renderBookmarks(selectedCategory = null) {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await API_GetBookmarks();
    let categorys = []
    eraseContent();
    if (bookmarks !== null) {
        bookmarks.forEach(bookmark => {
            if(selectedCategory != null){
                if(selectedCategory == bookmark.Category){
                    $("#content").append(renderBookmark(bookmark));
                }
            }
            else{
                $("#content").append(renderBookmark(bookmark));
            }
            double = false;
            categorys.forEach( category =>{
                if(bookmark.Category == category)
                    double = true;
            });
            if(!double){
                categorys.push(bookmark.Category)
            }
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".bookmarkRow").on("click", function (e) { e.preventDefault(); })
        updateDropDownMenu(categorys);

    } else {
        renderError("Service introuvable");
    }
    updateDropDownMenu(categorys);
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await API_GetBookmark(id);
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Favori introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await API_GetBookmark(id);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le favoris suivant?</h4>
            <br>
            <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
                <div class="bookmarkContainer">
                    <div class="bookmarkLayout">
                        <a id="favicon" href="${bookmark.Url}"><img class="bookmarkUrl" src="http://www.google.com/s2/favicons?domain=${bookmark.Url}" alt="" title="favicon"/></a>
                        <span class="bookmarkTitle">${bookmark.Title}</span>
                        <span class="bookmarkCategory">${bookmark.Category}</span>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteBookmark(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Favoris introuvable!");
    }
}
function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "";
    bookmark.Category = "";
    return bookmark;
}
function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newBookmark();
    let urlFavicon = "";
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#Url").blur(()=>{
        urlFavicon = $(this).val()  
        console.log(urlFavicon);
    })
    $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>
            
            <img class="bookmarkUrl" src="http://www.google.com/s2/favicons?domain=${bookmark.Url}" alt="" title="favicon"/>            
            <br>
            <label for="Title" class="form-label">Title </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un Titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Url" class="form-label">URL </label>
            <input
                class="form-control url"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer un Url" 
                InvalidMessage="Veuillez entrer un Url valide"
                value="${bookmark.Url}" 
            />
            <label for="Category" class="form-label">Catégorie </label>
            <input 
                class="form-control Category"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer la catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${bookmark.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await API_SaveBookmark(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

//// FIN SECTION MODIFIER
async function renderContacts() {
    showWaitingGif();
    $("#actionTitle").text("Liste des contacts");
    $("#createContact").show();
    $("#abort").hide();
    let contacts = await API_GetContacts();
    eraseContent();
    if (contacts !== null) {
        contacts.forEach(contact => {
            $("#content").append(renderContact(contact));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditContactForm(parseInt($(this).attr("editContactId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteContactForm(parseInt($(this).attr("deleteContactId")));
        });
        $(".contactRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateContactForm() {
    renderContactForm();
}
async function renderEditContactForm(id) {
    showWaitingGif();
    let contact = await API_GetContact(id);
    if (contact !== null)
        renderContactForm(contact);
    else
        renderError("Contact introuvable!");
}
async function renderDeleteContactForm(id) {
    showWaitingGif();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let contact = await API_GetContact(id);
    eraseContent();
    if (contact !== null) {
        $("#content").append(`
        <div class="contactdeleteForm">
            <h4>Effacer le contact suivant?</h4>
            <br>
            <div class="contactRow" contact_id=${contact.Id}">
                <div class="contactContainer">
                    <div class="contactLayout">
                        <div class="contactName">${contact.Name}</div>
                        <div class="contactPhone">${contact.Phone}</div>
                        <div class="contactEmail">${contact.Email}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteContact').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteContact(contact.Id);
            if (result)
                renderContacts();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderContacts();
        });
    } else {
        renderError("Contact introuvable!");
    }
}
function newContact() {
    contact = {};
    contact.Id = 0;
    contact.Name = "";
    contact.Phone = "";
    contact.Email = "";
    return contact;
}
function renderContactForm(contact = null) {
    $("#createContact").hide();
    $("#abort").show();
    eraseContent();
    let create = contact == null;
    if (create) contact = newContact();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="contactForm">
            <input type="hidden" name="Id" value="${contact.Id}"/>

            <label for="Name" class="form-label">Nom </label>
            <input 
                class="form-control Alpha"
                name="Name" 
                id="Name" 
                placeholder="Nom"
                required
                RequireMessage="Veuillez entrer un nom"
                InvalidMessage="Le nom comporte un caractère illégal" 
                value="${contact.Name}"
            />
            <label for="Phone" class="form-label">Téléphone </label>
            <input
                class="form-control Phone"
                name="Phone"
                id="Phone"
                placeholder="(000) 000-0000"
                required
                RequireMessage="Veuillez entrer votre téléphone" 
                InvalidMessage="Veuillez entrer un téléphone valide"
                value="${contact.Phone}" 
            />
            <label for="Email" class="form-label">Courriel </label>
            <input 
                class="form-control Email"
                name="Email"
                id="Email"
                placeholder="Courriel"
                required
                RequireMessage="Veuillez entrer votre courriel" 
                InvalidMessage="Veuillez entrer un courriel valide"
                value="${contact.Email}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#contactForm').on("submit", async function (event) {
        event.preventDefault();
        let contact = getFormData($("#contactForm"));
        contact.Id = parseInt(contact.Id);
        showWaitingGif();
        let result = await API_SaveContact(contact, create);
        if (result)
            renderContacts();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderContacts();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderContact(contact) {
    return $(`
     <div class="contactRow" contact_id=${contact.Id}">
        <div class="contactContainer noselect">
            <div class="contactLayout">
                <span class="contactName">${contact.Name}</span>
                <span class="contactPhone">${contact.Phone}</span>
                <span class="contactEmail">${contact.Email}</span>
            </div>
            <div class="contactCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editContactId="${contact.Id}" title="Modifier ${contact.Name}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteContactId="${contact.Id}" title="Effacer ${contact.Name}"></span>
            </div>
        </div>
    </div>           
    `);
}