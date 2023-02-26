//даный клас для того чтоб показывать маленькую модалку в форме в случае ошибки авторизации/регистрации или же ее успехе
class ModalWindow {
    renderWindow () {
        const modalContainer = document.createElement("div");
        modalContainer.classList.add("modal-container");
        const window = document.createElement("div");
        window.classList.add("modal-window");
        const title = document.createElement("p");
        title.classList.add("modal-title");
        title.id = "modal-title-message"
        window.append(title);
        const containerForMessage = document.createElement("div");
        containerForMessage.id = "modal-text-message"
        const buttonModal = document.createElement("button");
        buttonModal.innerText = "OK";
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-modal-container");
        buttonContainer.append(buttonModal);
        window.append(containerForMessage, buttonContainer);
        modalContainer.append(window);

        buttonModal.addEventListener("click", () => {
            modalContainer.remove();
        });
        document.querySelector(".project__form-container").append(modalContainer);
    }
}

export class ModalWindowError extends ModalWindow {
    constructor (resultRequest) {
        super();
        this.resultRequest = resultRequest;
    }
    renderWindowError() {
        super.renderWindow();
        document.getElementById("modal-title-message").innerText = "There was an error:";
        for (let error in this.resultRequest) {
            const textError = document.createElement("p");
            textError.classList.add("modal-text-error");
            textError.innerText = this.resultRequest[error];
            document.getElementById("modal-text-message").append(textError);
        }
    }
}

export class ModalWindowMessage extends ModalWindow {
    renderWindowMessage () {
        super.renderWindow();
        document.getElementById("modal-title-message").innerText =
        "Successfully registration! Now you must log in.";
    }
}