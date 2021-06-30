import {UndoableCommand} from 'interacto';
import {Component} from 'react';

export class SetText extends UndoableCommand {
    private memento: string = '';

    public constructor(private component: Component, private txt: keyof Readonly<{}>, private textFieldValue: keyof Readonly<{}>, private newText?: string) {
        super();
        this.newText = "";
    }

    protected createMemento() {
        this.memento = this.component.state[this.txt];
    }

    protected execution() {
        this.component.setState({[this.txt]: this.newText});
        this.component.setState({[this.textFieldValue]: this.newText});
    }

    public canExecute() {
        return this.newText !== undefined;
    }

    public set text(txt: string) {
        this.newText = txt;
    }

    public undo() {
        this.component.setState({[this.txt]: this.memento});
        this.component.setState({[this.textFieldValue]: this.memento});
    }

    public redo() {
        this.execution();
    }

    public getUndoName() {
        return 'Set text';
    }

    public getVisualSnapshot() {
      return this.newText;
    }
}
