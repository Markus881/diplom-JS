import { inputsConfig } from "./modules/inputsConfig.js";
import { Input } from "./modules/InputClass.js";
import { Form } from "./modules/FormClass.js";
import { Task } from "./modules/TaskClass.js";

import "./index.html";
import "./index.scss";

export const userAuthorization = async () => {
  const authForm = new Form({
    inputEmail: new Input(inputsConfig.email),
    inputName: new Input(inputsConfig.name),
    inputPassword: new Input(inputsConfig.password),
    inputPassSwitch: new Input(inputsConfig.inputPassSwitch),
  });

  if (sessionStorage.getItem("authorizedUser")) {
    await authForm.sessionAuthorization();
    renderTaskUI(authForm.formContainer);
  } else {
    authForm.renderLoginOrRegisterForm(authForm.formContainer);
  }
};

export const renderTaskUI = (container) => {
  const tasksUI = new Task({
    inputTaskName: new Input(inputsConfig.taskName),
    inputTaskDescription: new Input(inputsConfig.taskDescription),
  });

  tasksUI.renderTaskForm(container);
};

userAuthorization();
