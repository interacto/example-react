import {UndoableCommand} from 'interacto';

export class ClearText extends UndoableCommand {
    constructor(component, text, textFieldValue) {
        super();
        this.memento = "";
        this.component = component;
        this.text = text;
        this.textFieldValue = textFieldValue;
    }

    createMemento() {
        this.memento = this.component.state[this.text];
    }

    execution() {
        this.component.setState({[this.textFieldValue]: ''});
        this.component.setState({[this.text]: ''});
    }

    undo() {
        this.component.setState({[this.text]: this.memento});
        this.component.setState({[this.textFieldValue]: this.memento});
    }

    redo() {
        this.execution();
    }

    getUndoName() {
        return 'Clear text';
    }
}
