import './App.css';
import Tabs from "./components/Tabs";
import {Redo, Undo} from "interacto";
import React, {Component} from "react";
import PropTypes from "prop-types";
import {ClearText} from "./command/ClearText";
import {SetText} from "./command/SetText";
import {UndoHistoryReact} from "./command/UndoHistoryReact";
import {HistoryGoBack} from "./command/HistoryGoBack";
import {HistoryGoForward} from "./command/HistoryGoForward";
import {HistoryBackToStart} from "./command/HistoryBackToStart";
import {DrawRect} from "./command/DrawRect";
import {ChangeColor} from "./command/ChangeColor";
import {DeleteElt} from "./command/DeleteElt";

class App extends Component {
    static propTypes = {
        bindings: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            txt: "foo", // Text stored by the undo/redo system
            textFieldValue: "foo", // Current text content of the text field
            bindings: this.props.bindings,
        };

        this.state.bindings.undoHistory = new UndoHistoryReact(this);

        this.onTextChange = this.onTextChange.bind(this);

        this.clearTextButton = React.createRef();
        this.textArea = React.createRef();
        this.undoButton = React.createRef();
        this.redoButton = React.createRef();
        this.undoButtonContainer = React.createRef();
        this.redoButtonContainer = React.createRef();
        this.baseStateButton = React.createRef();
        this.canvas = React.createRef();

        this.undoButtons = [];
    }

    componentDidMount() {
        this.setupBindings();

        const drawrect = new DrawRect(this.canvas.current);
        drawrect.setCoords(10, 10, 300, 300);
        drawrect.execute();
    }

    setupBindings() {
        const {
            state: {
                bindings,
            },
        } = this;

        bindings.buttonBinder()
            .on(this.clearTextButton.current)
            .toProduce(() => new ClearText(this))
            .bind();

        bindings.textInputBinder()
            .on(this.textArea.current)
            .toProduce(() => new SetText(this))
            .then((c, i) => c.text = i.widget.value)
            .end(() => this.forceUpdate())
            .bind();

        bindings.buttonBinder()
            .on(this.undoButton.current)
            .toProduce(() => new Undo(this.state.bindings.undoHistory))
            .bind();

        bindings.buttonBinder()
            .on(this.redoButton.current)
            .toProduce(() => new Redo(bindings.undoHistory))
            .bind();

        bindings.buttonBinder()
            .on(this.baseStateButton.current)
            .toProduce(() => new HistoryBackToStart(this.state.bindings.undoHistory))
            .bind();

        bindings.buttonBinder()
            .onDynamic(this.undoButtonContainer.current)
            .toProduce(i => new HistoryGoBack(Array.from(this.undoButtonContainer.current.childNodes).indexOf(i.widget), this.state.bindings.undoHistory))
            .bind();

        bindings.buttonBinder()
            .onDynamic(this.redoButtonContainer.current)
            .toProduce(i => new HistoryGoForward(Array.from(this.redoButtonContainer.current.childNodes).indexOf(i.widget), this.state.bindings.undoHistory))
            .bind();

        bindings.tapBinder(3)
            .toProduce(i => new ChangeColor(i.taps[0].currentTarget))
            .onDynamic(this.canvas.current)
            .when(i => i.taps[0].currentTarget !== this.canvas.nativeElement
                && i.taps[0].currentTarget instanceof SVGElement)
            // Does not continue to run if the first targeted node is not an SVG element
            .strictStart()
            .bind();

        bindings.longTouchBinder(2000)
            .toProduce(i => new DeleteElt(this.canvas.current, i.currentTarget))
            .onDynamic(this.canvas.current)
            .when(i => i.currentTarget !== this.canvas.current && i.currentTarget instanceof SVGElement)
            // Prevents the context menu to pop-up
            .preventDefault()
            // Consumes the events before the multi-touch interaction and co use them
            .stopImmediatePropagation()
            .bind();
    }

    onTextChange(evt) {
        this.setState({textFieldValue: evt.target.value});
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
                        <button className="history-button-active" ref={this.baseStateButton}>Start</button>

                        <div ref={this.undoButtonContainer}>
                            {this.state.bindings.undoHistory.undos.map((elt, index) =>
                                <button className="history-button-active" key={index} ref={(ref) => this.undoButtons[index] = ref}>{elt.getUndoName()}</button>
                            )}
                        </div>

                        <div ref={this.redoButtonContainer}>
                            {this.state.bindings.undoHistory.redos.slice().reverse().map((elt, index) =>
                                <button className="history-button-inactive" key={index}>{elt.getUndoName()}</button>
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

                            <svg width="1000" height="600" style={{border: "1px solid black"}} ref={this.canvas}>
                            </svg>
                        </div>

                        <div label="Drag the cards">

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
