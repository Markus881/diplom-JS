import { request } from "./APIClass.js";
import { ModalWindowMessage } from "./ModalClass.js";
import { renderTaskUI, userAuthorization } from "../index.js";
export class Form {
    constructor (options) {
        const {
            inputEmail,
            inputName,
            inputPassword,
            inputPassSwitch,
        } = options;
        this.inputEmail = inputEmail;
        this.inputName = inputName;
        this.inputPassword = inputPassword;
        this.inputPassSwitch = inputPassSwitch;
        this.isActiveRegister = false;
        this.formContainer = document.body.querySelector(".project");
    }

    renderLoginOrRegisterForm (container) {
        const formContainer = document.createElement("div");
        formContainer.classList.add("project__form-container");

        const form = document.createElement("form");
        form.classList.add("project__form");

        const formHeaderContainer = document.createElement("div");
        formHeaderContainer.classList.add("project__form-select");
        const formHeaderLogin = document.createElement("p");
        formHeaderLogin.innerText = "Login";
        const formHeaderRegister = document.createElement("p");
        formHeaderRegister.innerText = "Register";
        formHeaderContainer.append(formHeaderLogin, formHeaderRegister);
        form.append(formHeaderContainer);

        this.inputEmail.createInput(form);

        if (this.isActiveRegister) {
            this.inputName.createInput(form);
            formHeaderRegister.classList.add("bold");
        } else {
            formHeaderLogin.classList.add("bold");
        }

        this.inputPassword.createInput(form); 

        this.inputPassSwitch.createCheckbox(form); 

        const button = document.createElement("button");
        button.setAttribute("type", "submit");
        button.innerText = "Submit";
        button.id = "submit-button"
        
        form.append(button); 

        formContainer.append(form);
        formContainer.classList.add("set-opacity");
        container.append(formContainer);

        formHeaderLogin.addEventListener("click", () => {
            this.formContainer.innerHTML = "";
            this.isActiveRegister = false;
            this.renderLoginOrRegisterForm(this.formContainer);
        });
        formHeaderRegister.addEventListener("click", () => {
            this.formContainer.innerHTML = "";
            this.isActiveRegister = true;
            this.renderLoginOrRegisterForm(this.formContainer);
        });

        this.loginOrRegisterUser(form);
    }


    inputsValidation () {
        const name = document.getElementById("input_name");
        const email = document.getElementById("input_email");
        const password = document.getElementById("input_password");
        const NAME_REGEX = /^(?=.{1,20}$)(?![_.])[a-zA-Z0-9._]+[^._]$/;
        const EMAIL_REGEX = /([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+/gm;
        const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        let isEmailValid = EMAIL_REGEX.test(email.value.trim());
        let isPasswordValid = PASS_REGEX.test(password.value.trim());
        let isNameValid = true;
        if (!name) {
            this.isInputDataValid = isEmailValid && isPasswordValid;
        } else {
            isNameValid = NAME_REGEX.test(name.value.trim());
            this.isInputDataValid = isNameValid && isEmailValid && isPasswordValid;
        }

        const errorsInputs = document.querySelectorAll(".error-red-background");
            if (errorsInputs.length > 0) { 
                errorsInputs.forEach ((node) => {
                node.classList.remove("error-red-background");
                document.getElementById(`tooltip_${node.id}`).setAttribute("hidden", "");
            });
            }

        if (!this.isInputDataValid) {
            let invalidInputData = { isNameValid, isEmailValid, isPasswordValid };
            for (let inputValue in invalidInputData) {
                if (!invalidInputData[inputValue]) {
                    switch (inputValue) {  
                        case "isNameValid":
                            document.getElementById("tooltip_input_name").removeAttribute("hidden");
                            document.getElementById("input_name").classList.add("error-red-background");
                            break;
                        case "isEmailValid":
                            document.getElementById("tooltip_input_email").removeAttribute("hidden");
                            document.getElementById("input_email").classList.add("error-red-background");
                            break;
                        case "isPasswordValid":
                            document.getElementById("tooltip_input_password").removeAttribute("hidden");
                            document.getElementById("input_password").classList.add("error-red-background");
                            break;
                    }
                }
            }
        }
    }
   
    loginOrRegisterUser (form) {

        const handleFormSubmit = async (event) => {
            const formData = new FormData(event.target);
            event.target.reset();

            let currentInputs = document.querySelectorAll(".project__form-input");
            currentInputs.forEach((input) => {
                input.nextElementSibling.setAttribute("hidden", "");
            })

            const convertFormDataToObject = (formData) => {
                const formValues = {};
                for (let pair of formData.entries()) {
                    formValues[pair[0]] = pair[1].trim();
                }
                return formValues;
            }

            const resultSubmit = convertFormDataToObject(formData);
            const { input_email: email, input_name: name, input_password: password} = resultSubmit;
            
            if (this.isActiveRegister) {
                const endpointToRegister = "https://byte-tasks.herokuapp.com/api/auth/register";
                const bodyRegister = { email, name, password };
                await request.post({
                    endpoint: endpointToRegister,
                    body: bodyRegister,
                });
                this.isActiveRegister = false;
                this.formContainer.innerHTML = "";
                this.renderLoginOrRegisterForm(this.formContainer);

                const message = new ModalWindowMessage();
                message.renderWindowMessage();
            } else {
                
                const endpointToLogin = "https://byte-tasks.herokuapp.com/api/auth/login";
                const bodyLogin = { email, password };
                await request.post({
                    endpoint: endpointToLogin,
                    body: bodyLogin,
                });
                this.tokenAuthorization = request.tokenAuthorization;
                this.getLogoutInHeader(this.tokenAuthorization);
                sessionStorage.setItem("authorizedUser", JSON.stringify({ email, password }));
                this.formContainer.innerHTML = "";
            }
        }
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            this.inputsValidation();

            if (this.isInputDataValid) {
                await handleFormSubmit (event);
                if (this.tokenAuthorization) {
                    renderTaskUI(this.formContainer);
                }
            }
        })
    }
   
    async sessionAuthorization () {
        const authorizedUser = JSON.parse(sessionStorage.getItem("authorizedUser"));
        const { email, password} = authorizedUser;
        const endpointToLogin = "https://byte-tasks.herokuapp.com/api/auth/login";
        const bodyLogin = { email, password };
        await request.post({
            endpoint: endpointToLogin,
            body: bodyLogin,
        });
        this.tokenAuthorization = request.tokenAuthorization;
        this.getLogoutInHeader(this.tokenAuthorization);
        this.formContainer.innerHTML = "";
    }
    
    async getLogoutInHeader (tokenAuthorization) {
        await request.get({
            endpoint: "https://byte-tasks.herokuapp.com/api/auth/user/self",
            token: tokenAuthorization,
        });
        const logoutContainer = document.createElement("div");
        logoutContainer.classList.add("header-logout-container");
        const logoutButton = document.createElement("button");
        logoutButton.innerText = "LOGOUT";
        const username = document.createElement("p");
        username.innerText = request.resultGetRequest.name;

        logoutButton.addEventListener("click", () => {
            logoutContainer.remove();
            document.getElementById("taskform-container").remove();
            document.getElementById("taskcards-container").remove();
            sessionStorage.removeItem("authorizedUser");

            userAuthorization();
        })

        logoutContainer.append(logoutButton, username);
        document.querySelector(".header").append(logoutContainer);
    }
}
