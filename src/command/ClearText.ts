import {UndoableCommand} from 'interacto';
import {Component} from 'react';

export class ClearText extends UndoableCommand {
    private memento: string = '';

    public constructor(private component: Component, private readonly text: keyof Readonly<{}>, private readonly textFieldValue: keyof Readonly<{}>) {
        super();
    }

    protected createMemento() {
        this.memento = this.component.state[this.text];
    }

    protected execution() {
        this.component.setState({[this.textFieldValue]: ''});
        this.component.setState({[this.text]: ''});
    }

    public undo() {
        this.component.setState({[this.text]: this.memento});
        this.component.setState({[this.textFieldValue]: this.memento});
    }

    public redo() {
        this.execution();
    }

    public getUndoName() {
        return 'Clear text';
    }
}
