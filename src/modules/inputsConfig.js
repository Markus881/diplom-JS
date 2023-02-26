export const inputsConfig = {
  name: {
    name: "input_name",
    placeholder: "enter your name",
    label: "Name",
    styleClass: "project__form-input",
    toolTipText:
      'name must be in English, 2-20 characters long, only letters and numbers, no "_" or "." at the beginning or at the end',
  },

  password: {
    name: "input_password",
    placeholder: "enter your password",
    label: "Password",
    type: "password",
    styleClass: "project__form-input",
    toolTipText:
      "password must be in English, minimum 8 characters, one uppercase letter, one lowercase letter and one number",
  },

  email: {
    name: "input_email",
    placeholder: "enter your email",
    label: "Email",
    styleClass: "project__form-input",
    toolTipText: "email format - username@example.com",
  },

  inputPassSwitch: {
    name: "pass-checkbox",
    type: "checkbox",
    isInputRequired: false,
  },

  taskName: {
    name: "input_task_name",
    placeholder: "enter name of your task",
    label: "Task name",
    styleClass: "project__form-task-input",
  },

  taskDescription: {
    name: "input_task_description",
    placeholder: "enter your description",
    label: "Task description",
    styleClass: "project__form-task-input",
    isInputRequired: false,
  },
};
