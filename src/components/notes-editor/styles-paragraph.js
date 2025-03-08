class StyledParagraph {
    static get toolbox() {
      return {
        title: "Highlight Block",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" color="#000000" fill="none">
        <path d="M3 11C3 7.25027 3 5.3754 3.95491 4.06107C4.26331 3.6366 4.6366 3.26331 5.06107 2.95491C6.3754 2 8.25027 2 12 2C15.7497 2 17.6246 2 18.9389 2.95491C19.3634 3.26331 19.7367 3.6366 20.0451 4.06107C21 5.3754 21 7.25027 21 11V13C21 16.7497 21 18.6246 20.0451 19.9389C19.7367 20.3634 19.3634 20.7367 18.9389 21.0451C17.6246 22 15.7497 22 12 22C8.25027 22 6.3754 22 5.06107 21.0451C4.6366 20.7367 4.26331 20.3634 3.95491 19.9389C3 18.6246 3 16.7497 3 13V11Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M15 9.5L7 9.5M10 14.5H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>`,
      };
    }
  
    constructor({ data, readOnly }) {
      this.data = data || { text: "" };
      this.wrapper = null;
      this.readOnly = readOnly;
    }
  
    render() {
      this.wrapper = document.createElement("div");
      this.wrapper.style.padding = "16px";
      this.wrapper.style.background = "#F8F9FC";
      this.wrapper.style.borderRadius = "4px";
      this.wrapper.style.fontSize = "16px";
      this.wrapper.style.fontWeight = this.readOnly ? "500" : "normal"; // Adjust font weight based on readOnly

      if (this.readOnly) {
        this.wrapper.innerHTML = this.data.text || "";
      } else {
        this.contentEditableDiv = document.createElement("div");
        this.contentEditableDiv.contentEditable = true;
        this.contentEditableDiv.innerHTML = this.data.text || "";
        this.contentEditableDiv.style.outline = "none"; // Removes default focus outline
        this.wrapper.appendChild(this.contentEditableDiv);
      }
      
      return this.wrapper;
    }
  
    save() {
      return {
        text: this.readOnly ? this.data.text : this.contentEditableDiv.innerHTML,
      };
    }

    isReadOnlySupported() {
      return true;
    }
  }

  export default StyledParagraph;