import { request } from "./APIClass.js";
export class Task {
    constructor(options) {
        const {
            inputTaskName,
            inputTaskDescription
        } = options;
        this.inputTaskName = inputTaskName;
        this.inputTaskDescription = inputTaskDescription;
        this.baseEndpointTask = "https://byte-tasks.herokuapp.com/api/task/";
    }
  
    async renderTaskForm(container) {
        const taskFormContainer = document.createElement("div");
        taskFormContainer.classList.add("project__taskform-container");
        taskFormContainer.id = "taskform-container";
        const taskForm = document.createElement("form");

        this.inputTaskName.createInput(taskForm);
        this.inputTaskDescription.createInput(taskForm);

        const button = document.createElement("button");
        button.innerText = "ADD";
        button.id = "submit-button"; 
        taskForm.append(button);
        taskFormContainer.append(taskForm);
        taskFormContainer.classList.add("set-opacity");
        container.append(taskFormContainer);

        taskForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            event.target.reset();

            this.submitTaskForm(formData);

        });

        const cardsContainer = document.createElement("div");
        cardsContainer.classList.add("project__taskcards-container");
        cardsContainer.id = "taskcards-container";
        container.append(cardsContainer);

        await request.get({
            endpoint: this.baseEndpointTask,
            token: request.tokenAuthorization,
        })

        this.renderAllCards(request.resultGetRequest);
    }

    async submitTaskForm(formData) {

        const convertFormDataToObject = (formData) => {
            const formValues = {};
            for (let pair of formData.entries()) {
                formValues[pair[0]] = pair[1].trim();
            }
            return formValues;
        }
        const resultSubmit = convertFormDataToObject(formData);
        let {
            input_task_name: name,
            input_task_description: description
        } = resultSubmit;
        if (!description) {
            description = "No description."
        }
        let endpoint = this.baseEndpointTask;
        const bodyAddTask = {
            name,
            description
        };

        await request.post({
            endpoint: endpoint,
            body: bodyAddTask,
        });

        endpoint = `${this.baseEndpointTask}${request.cardAddId}`;

        await request.get({
            endpoint: endpoint,
            token: request.tokenAuthorization,
        })

        this.renderNewCard(request.resultGetRequest);
    }

    getDateCreated(dateCreate) {
        let dateCreateArr = dateCreate.split("T");
        let dateArr = dateCreateArr[0].split("-");
        let dateToCard = `${dateArr[2]}/${dateArr[1]}/${dateArr[0]}`;
        let time = dateCreateArr[1].slice(0, 8);
        let timeArr = time.split(":");
        let timeToCard = "";
        if (+timeArr[0] < 12) {
            timeToCard = `${time} AM`;
        } else {
            timeToCard = `${+timeArr[0] - 12}:${timeArr[1]}:${timeArr[2]} PM`;
        }
        return `${dateToCard} ${timeToCard}`;
    }
   
    getTimeTracking(timeSeconds) {
        let savedTimeSeconds = Math.round(+timeSeconds / 1000);
        const checkLength = (data) => {
            if (data < 10) {
                return `0${data}`;
            } else {
                return `${data}`;
            }
        }
        let hours = checkLength(Math.floor(savedTimeSeconds / 3600));
        let minutes = checkLength(Math.floor(((savedTimeSeconds - (hours * 3600)) / 60)));
        let seconds = checkLength(savedTimeSeconds % 60);
        return `${hours}:${minutes}:${seconds}`;
    }
    
    renderAllCards(cardsData) {
        for (let i = 0; i < cardsData.length; i++) {
            this.renderNewCard(cardsData[i]);
        }
    }
    
    renderNewCard(cardsData) {
        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("project__taskcard");
        cardWrapper.id = cardsData._id;
        if (cardsData.isFinished) {
            cardWrapper.classList.toggle("toggle-done-task");
        }

        const cardName = document.createElement("h4");
        cardName.classList.add("project__taskcard-name");
        cardName.innerText = cardsData.name;

        const cardDescription = document.createElement("p");
        cardDescription.classList = "project__taskcard-description";
        cardDescription.innerText = cardsData.description;

        const timeTrackedWrapper = document.createElement("div");
        timeTrackedWrapper.classList.add("project__taskcard-checkbox-container")
        const checkboxTimeTracked = document.createElement("input");
        checkboxTimeTracked.setAttribute("type", "checkbox");
        checkboxTimeTracked.classList.add("project__taskcard-checkbox");
        const checkboxWrapper = document.createElement("div");
        checkboxWrapper.classList.add("project__taskcard-checkbox-wrapper");
        const checkboxCheck1 = document.createElement("div");
        const checkboxCheck2 = document.createElement("div");
        const timeTracker = document.createElement("p");
        timeTracker.classList.add("project__taskcard-time");
        timeTracker.innerText = this.getTimeTracking(cardsData.timeTracked);
        if (cardsData.isActive) {
            checkboxTimeTracked.checked = true;
        }
        checkboxWrapper.append(checkboxCheck1, checkboxCheck2);
        timeTrackedWrapper.append(checkboxTimeTracked, checkboxWrapper, timeTracker);

        const dateCreate = document.createElement("p");
        dateCreate.classList.add("project__taskcard-date");
        dateCreate.innerText = this.getDateCreated(cardsData.createdAt);

        const doneButton = document.createElement("button");
        doneButton.classList.add("project__taskcard-btn");
        const innerText = cardsData.isFinished ? "Restart" : "Mark as done";
        doneButton.innerText = innerText;
        if (cardsData.isFinished) {
            checkboxTimeTracked.setAttribute("disabled", "");
            checkboxWrapper.classList.add("project__taskcard-checkbox-wrapper-grey");
        }

        const deleteTaskBtn = document.createElement("p");
        deleteTaskBtn.classList.add("project__taskcard-close");
        deleteTaskBtn.innerText = "X";

        this.setTimeTracking({
            checkboxTimeTracked,
            timeTracker,
            cardsData,
        });

        this.doneOrRestartCard({
            doneButton,
            cardWrapper,
            checkboxTimeTracked,
            checkboxWrapper,
            timeTracker,
            cardsData,
        })

        this.deleteCard({
            deleteTaskBtn,
            cardWrapper,
            cardsData,
        })

        cardWrapper.append(cardName, cardDescription, timeTrackedWrapper, dateCreate, doneButton, deleteTaskBtn);
        document.getElementById("taskcards-container").append(cardWrapper);
        cardWrapper.classList.add("set-opacity");
    }
    
    async setTimeTracking(options) {
        const {
            checkboxTimeTracked,
            timeTracker,
            cardsData,
        } = options;
        let currentIntervalId = null;
        const runTimer = async () => {
            await request.get({
                endpoint: `${this.baseEndpointTask}${cardsData._id}`,
                token: request.tokenAuthorization,
            });
            if (checkboxTimeTracked.checked) {
                let currentTimeSeconds = request.resultGetRequest.timeTracked;
                currentIntervalId = setInterval(() => {
                    if (!timeTracker.hasAttribute("finishedTask")) {
                        currentTimeSeconds += 1000;
                        timeTracker.innerText = this.getTimeTracking(currentTimeSeconds);
                    } else {
                        clearInterval(currentIntervalId);
                    }
                }, 1000);
            } else {
                clearInterval(currentIntervalId);
            }
        }
        runTimer();
        checkboxTimeTracked.addEventListener("change", async () => {
            let bodyPatchRequest = {};
            if (checkboxTimeTracked.checked) {
                bodyPatchRequest = {
                    isActive: true
                };
            } else {
                bodyPatchRequest = {
                    isActive: false
                };
            };
            await request.patch({
                endpoint: `${this.baseEndpointTask}${cardsData._id}`,
                body: bodyPatchRequest,
                token: request.tokenAuthorization,
            });
            runTimer();
        });
    }
    
    doneOrRestartCard(options) {
        const {
            doneButton,
            cardWrapper,
            checkboxTimeTracked,
            checkboxWrapper,
            timeTracker,
            cardsData
        } = options;

        doneButton.addEventListener("click", async (event) => {
            event.preventDefault();
            let bodyRequest = {};
            if (event.target.textContent !== "Restart") {
                doneButton.innerText = "Restart";
                bodyRequest = {
                    isActive: false,
                    isFinished: true
                };
                cardWrapper.classList.toggle("toggle-done-task");
                checkboxTimeTracked.checked = false;
                checkboxTimeTracked.setAttribute("disabled", "");
                timeTracker.setAttribute("finishedTask", "");
                checkboxWrapper.classList.add("project__taskcard-checkbox-wrapper-grey");
                
            } else {
                doneButton.innerText = "Mark as done";
                bodyRequest = {
                    isFinished: false,
                    timeTracked: 0
                };
                timeTracker.innerText = "00:00:00";
                cardWrapper.classList.toggle("toggle-done-task");
                timeTracker.removeAttribute("finishedTask");
                checkboxTimeTracked.removeAttribute("disabled");
                checkboxWrapper.classList.remove("project__taskcard-checkbox-wrapper-grey");
            }
            await request.patch({
                endpoint: `${this.baseEndpointTask}${cardsData._id}`,
                body: bodyRequest,
                token: request.tokenAuthorization,
            });
        });
    }
    
    deleteCard(options) {
        const {
            deleteTaskBtn,
            cardWrapper,
            cardsData,
        } = options
        deleteTaskBtn.addEventListener("click", () => {
            cardWrapper.classList.add("remove-opacity");
            setTimeout(() => {
                cardWrapper.remove();
            }, 1500);
            request.delete({
                endpoint: `${this.baseEndpointTask}${cardsData._id}`,
                token: request.tokenAuthorization,
            });
        });
    }
}
