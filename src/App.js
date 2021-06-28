import './App.css';
import Tabs from "./components/Tabs";
import {Redo, Undo} from "interacto";
import React, {Component} from "react";
import PropTypes from "prop-types";
import {ClearText} from "./command/ClearText";
import {SetText} from "./command/SetText";


class App extends Component {
    static propTypes = {
        bindings: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            txt: "foo", // Text stored by the undo/redo system
            textFieldValue: "foo", // Current text content of the text field
            bindings: this.props.bindings
        };

        this.onTextChange = this.onTextChange.bind(this);

        this.clearTextButton = React.createRef();
        this.textArea = React.createRef();
        this.undoButton = React.createRef();
        this.redoButton = React.createRef();
    }

    setupBindings() {
        const {
            state: {
                bindings,
            },
        } = this;

        bindings.buttonBinder()
            .on(this.clearTextButton.current)
            .toProduce((i) => new ClearText(this))
            .bind();

        bindings.textInputBinder()
            .on(this.textArea.current)
            .toProduce(() => new SetText(this))
            .then((c, i) => c.text = i.widget.value)
            .end(() => this.forceUpdate())
            .bind();

        bindings.buttonBinder()
            .on(this.undoButton.current)
            .toProduce(() => new Undo(bindings.undoHistory))
            .bind();

        bindings.buttonBinder()
            .on(this.redoButton.current)
            .toProduce(() => new Redo(bindings.undoHistory))
            .bind();

        console.log('bindings done');
    }

    componentDidMount() {
        this.setupBindings();
    }

    onTextChange(evt) {
        // this.props.dataService.txt = evt.target.value;
        this.setState({textFieldValue: evt.target.value});
        // this.props.txt = evt.target.value;
        console.log(this.state.txt);
    }

    render() {
        return (
            <div>
                <div className="history">
                    <div className="header">
                        <h2>HISTORY</h2>
                        <button className="button-undo-redo" ref={this.undoButton}>UNDO</button>
                        <button className="button-undo-redo" ref={this.redoButton}>REDO</button>
                    </div>

                    <div className="buttons">
                        <button className="history-button-active">Start</button>

                        <div>
                            {this.props.bindings.undoHistory.getUndo().map((elt, index) =>
                                <div key={index}>
                                    <button className="history-button-active">{elt.getUndoName()}</button>
                                    <br/>
                                </div>
                            )}
                        </div>

                        <div>
                            {this.props.bindings.undoHistory.getRedo().map((elt, index) =>
                                <div key={index}>
                                    <button className="history-button-inactive">{elt.getUndoName()}</button>
                                    <br/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="main">
                    <h1>An Interacto-React app</h1>

                    <Tabs>
                        <div label="Type some text">
                            <textarea value={this.state.textFieldValue} onChange={this.onTextChange} ref={this.textArea}/>
                            <br/>
                            <button className="clearTextButton" ref={this.clearTextButton}>Clear text</button>
                            <br/><br/>
                        </div>

                        <div label="Create and edit rectangles">
                            <p>
                                Multi-touch (two touches) creates a rectangle.<br/>
                                Three taps changes the color of the targeted rectangle.<br/>
                                A long touch (2 seconds) removes the targeted rectangle.<br/>
                                Swipe horizontally to clear all the SVG shapes.<br/>
                            </p>
                            <br/>

                            <svg width="1000" height="600" style={{border: "1px solid black"}}>
                            </svg>
                        </div>

                        <div label="Drag the cards">
                            Nothing to see here, this tab is <em>extinct</em>!
                        </div>
                    </Tabs>

                    {/*<Tabs>*/}
                    {/*    /!*<app-tab tabTitle="Drag the cards">*!/*/}
                    {/*    /!*    <div class="cards-block">*!/*/}
                    {/*    /!*        <mat-card>*!/*/}
                    {/*    /!*            <mat-card-header>*!/*/}
                    {/*    /!*                <mat-card-title>card title</mat-card-title>*!/*/}
                    {/*    /!*                <mat-card-subtitle>subTitle</mat-card-subtitle>*!/*/}
                    {/*    /!*            </mat-card-header>*!/*/}
                    {/*    /!*            <mat-card-content>*!/*/}
                    {/*    /!*                <p>*!/*/}
                    {/*    /!*                    text*!/*/}
                    {/*    /!*                </p>*!/*/}
                    {/*    /!*            </mat-card-content>*!/*/}
                    {/*    /!*        </mat-card>*!/*/}
                    {/*    /!*    </div>*!/*/}

                    {/*    /!*    <div class="cards-block">*!/*/}
                    {/*    /!*    <mat-card>*!/*/}
                    {/*    /!*        <mat-card-header>*!/*/}
                    {/*    /!*            <mat-card-title>title</mat-card-title>*!/*/}
                    {/*    /!*            <mat-card-subtitle>subTitle</mat-card-subtitle>*!/*/}
                    {/*    /!*        </mat-card-header>*!/*/}
                    {/*    /!*        <mat-card-content>*!/*/}
                    {/*    /!*            <p>*!/*/}
                    {/*    /!*                text*!/*/}
                    {/*    /!*            </p>*!/*/}
                    {/*    /!*        </mat-card-content>*!/*/}
                    {/*    /!*    </mat-card>*!/*/}
                    {/*    /!*    </div>*!/*/}
                    {/*    /!*</app-tab>*!/*/}
                    {/*</Tabs>*/}
                </div>

            </div>
        );
    }

}

export default App;
