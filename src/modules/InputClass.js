export class Input {
    constructor (options) {
        const {
            name,
            placeholder,
            label,
            type = "text",
            isInputRequired = true,
            styleClass,
            toolTipText,
        } = options;
        this.name = name;
        this.placeholder = placeholder;
        this.label = label;
        this.type = type;
        this.isInputRequired = isInputRequired;
        this.styleClass = styleClass;
        this.toolTipText = toolTipText;
    }
    
    createInput (container) {
        const input = document.createElement("input");
        input.setAttribute("placeholder", this.placeholder);
        input.setAttribute("type", this.type);
        input.setAttribute("name", this.name);
        if (this.type === "password") {
            input.setAttribute("autocomplete", "off");
        }
        input.classList.add(this.styleClass);
        input.id = this.name;
        if (this.isInputRequired) {
            input.setAttribute("required", "");
        }

        const label = document.createElement("label");
        label.setAttribute("for", this.name);
        label.innerText = this.label;

        if (this.toolTipText) {
            const toolTip = document.createElement("p");
            toolTip.innerText = this.toolTipText;
            toolTip.id = `tooltip_${this.name}`;
            toolTip.setAttribute("hidden", "");
            label.append(toolTip);
        }
        container.append(label, input);
    }

    createCheckbox (container) {
        
        const passCheckboxWrapper = document.createElement("div");
        passCheckboxWrapper.classList.add("project__form-checkbox-container")
        const passCheckboxContainer = document.createElement("div");
        const hiddenParagraph = document.createElement("p");
        hiddenParagraph.innerText = "hide";
        const showedParagraph = document.createElement("p");
        showedParagraph.innerText = "show";
        passCheckboxContainer.classList.add("project__form-checkbox")
        const passSwitchCheckbox = document.createElement("input");
        passSwitchCheckbox.id = this.name;
        passSwitchCheckbox.setAttribute("type", this.type);
        passSwitchCheckbox.classList.add("project__form-checkbox-input");
        passSwitchCheckbox.checked = false;
        const checkboxSpan = document.createElement("span");
        const passCheckboxLabel = document.createElement("label");
        passCheckboxLabel.classList.add("project__form-checkbox-label")
        passCheckboxLabel.setAttribute("for", this.name);

        passSwitchCheckbox.addEventListener("change", ()=> {
            const inputPassword = document.getElementById("input_password");
            passSwitchCheckbox.checked ? inputPassword.setAttribute("type", "text") : inputPassword.setAttribute("type", "password");
        });
        passCheckboxContainer.append(passSwitchCheckbox, checkboxSpan, passCheckboxLabel);
        passCheckboxWrapper.append(hiddenParagraph, passCheckboxContainer, showedParagraph);

        container.append(passCheckboxWrapper);
    }
}