import { ModalWindowError } from "./ModalClass.js";
class RequestApi {

    preloader (show) {
        if (show) {
            document.getElementById("preloader").style.display = "block";
        } else {
            document.getElementById("preloader").style.display = "none";
        }
    }
//post запрос реализован 1 для любых вариантов использования (как для авторизации так и для отправки данных)
//соответственно из-за этого там есть проверки на наличие опредленных данных для корректной работы в каждом случае
    post = async (options) => {
        const { endpoint, body } = options;
        try {
            this.preloader(true);
            const submitButton = document.getElementById("submit-button");
            if (submitButton) {
                submitButton.setAttribute("disabled", "");
            }
            let headers = {
                "Content-Type": "application/json;charset=utf-8"
            };
            if (this.tokenAuthorization) {
                headers = {
                    "Content-Type": "application/json;charset=utf-8",
                    "Authorization": `Bearer ${this.tokenAuthorization}`
                };
            }
            const response = await fetch(endpoint, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body)
            });
            if (response.ok) {
                const resultRequest = await response.json();
                if (resultRequest.token) {
                    this.tokenAuthorization = resultRequest.token;//получаем 1-й токен
                }
                if (resultRequest._id) {
                    this.cardAddId = resultRequest._id;
                }
                this.preloader(false);
                if (submitButton) {
                    submitButton.removeAttribute("disabled");
                }
            } else {
                const resultRequest = await response.json();
                const errorMessage = new ModalWindowError(resultRequest);
                errorMessage.renderWindowError();//сообщение с сервера о ошибках авторизации/регистрации
                this.preloader(false);
                if (submitButton) {
                    submitButton.removeAttribute("disabled");
                }
                throw new Error(`There was an error code ${response.status}`);
            }
        } catch (error) {
            this.preloader(false);
            throw new Error(error.message);
        }
    }

    get = async (options) => {
        const { endpoint, token } = options;
        this.tokenAuthorization = token;
        try {
            this.preloader(true);
            const response = await fetch(endpoint, {
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Authorization": `Bearer ${this.tokenAuthorization}`
                }
            })
            if (response.ok) {
                this.preloader(false);
                const resultRequest = await response.json();
                this.resultGetRequest = resultRequest;
            } else {
                this.preloader(false);
                throw new Error(`There was an error code ${response.status}`);
            }
        } catch (error) {
            this.preloader(false);
            throw new Error(error.message);
        }
    }

    delete = async (options) => {
        const { endpoint, token } = options;
        this.tokenAuthorization = token;
        try {
            const response = await fetch (endpoint, {
                method: "DELETE",
                headers:{
                    "Content-Type": "application/json;charset=utf-8",
                    "Authorization": `Bearer ${this.tokenAuthorization}`
                }
            });
            if (!response.ok) {
                throw new Error(`There was an error code ${response.status}`);
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    patch = async (options) => {
        const { endpoint, body, token } = options;
        this.tokenAuthorization = token;
        try {
            const response = await fetch(endpoint, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Authorization": `Bearer ${this.tokenAuthorization}`
                },
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                throw new Error(`There was an error code ${response.status}`);
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export const request = new RequestApi();