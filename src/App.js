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
import {Card} from "@material-ui/core";
import {TransferArrayItemReact} from "./command/TransferArrayItemReact";

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
            cards1: [{
                title: 'card 1',
                subTitle: 'The card 1',
                text: 'Some text for card 1'
            },
            {
                title: 'card 2',
                subTitle: 'The card 2',
                text: 'Some text for card 2'
            }],
            cards2: [{
                title: 'card 3',
                subTitle: 'The card 3',
                text: 'Some text for card 3'
            }],
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
        this.cards1 = React.createRef();
        this.cards2 = React.createRef();

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

        // This binder creates the command that allows the user to move a card from one list to another
        bindings.dndBinder(true)
            .on(window.document.body)
            .toProduce(() => {
                // The command is not executable until a proper target destination for the card has been selected by the user
                // The -1 index prevents makes canExecute() return false and prevents Interacto from executing the command
                return new TransferArrayItemReact(this, null, null, -1, 0, 'Drag card', true);
            })
            // Checks if the user picked a valid card, and a new list for the card as a destination
            .when(i => {
                // A valid card has to be selected in order to create the command
                const card = i.src.target.closest('.cards');
                return card !== null;
            })
            .first((c, i) => {
                this.card = (i.src.target).closest('.cards');
                this.sourceIndex = Array.prototype.indexOf.call(this.card.parentNode.children, this.card);
                // Saves the initial state of the card's style to be able to restore it if the command can't be executed
                this.mementoX = this.card.style.left;
                this.mementoY = this.card.style.top;
                this.mementoCSSPosition = this.card.style.position;
                // Edits the card's style to make it movable visually
                this.card.style.width = String(this.card.clientWidth) + 'px';
                this.card.style.position = 'absolute';
                this.card.style.zIndex = '999';
            })
            .then((c, i) => {
                // Retrieves the position of the mouse on the page
                let x = i.tgt.pageX;
                let y = i.tgt.pageY;
                // Prevents parts of the card from going outside of the document
                if (i.tgt.pageX > window.document.body.clientWidth - this.card.clientWidth) {
                    x = x - this.card.clientWidth - 5;
                }
                if (i.tgt.pageY > window.document.body.clientHeight - this.card.clientHeight) {
                    y = y - this.card.clientHeight - 5;
                }
                // Moves the card visually
                this.card.style.left = String(x) + 'px';
                this.card.style.top = String(y) + 'px';

                // Checks if the target selected is valid for the current card and makes the command executable if it is
                const isCardPositionValid = (this.card.parentNode === this.cards1.current ?
                    i.tgt.target === this.cards2.current : i.tgt.target === this.cards1.current);
                if (!isCardPositionValid) {
                    c.srcIndex = -1;
                } else {
                    c.srcIndex = this.sourceIndex;

                    // Defines which array is the source and which one is the target
                    const fromSrcToTgt = i.tgt.target === this.cards2.current && i.src.target !== this.cards1.current;
                    if (fromSrcToTgt) {
                        c.srcArray = 'cards1';
                        c.tgtArray = 'cards2';
                    } else {
                        c.srcArray = 'cards2';
                        c.tgtArray = 'cards1';
                    }
                }
            })
            // Resets the position of the card if the command is invalid or cancelled
            .ifCannotExecute(() => {
                this.card.style.left = this.mementoX;
                this.card.style.top = this.mementoY;
                this.card.style.position = this.mementoCSSPosition;
            })
            .cancel(() => {
                this.card.style.left = this.mementoX;
                this.card.style.top = this.mementoY;
                this.card.style.position = this.mementoCSSPosition;
            })
            .bind();

        bindings.buttonBinder()
            .on(this.clearTextButton.current)
            .toProduce(() => new ClearText(this, 'txt', 'textFieldValue'))
            .bind();

        bindings.textInputBinder()
            .on(this.textArea.current)
            .toProduce(() => new SetText(this, 'txt', 'textFieldValue'))
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
                            <app-tab tabTitle="Drag the cards">
                                <div className="cards-block" ref={this.cards1}>
                                    {this.state.cards1.map(card =>
                                        <Card className="cards" key={card.title}>
                                            <mat-card-header>
                                                <mat-card-title>{card.title}</mat-card-title>
                                                <mat-card-subtitle>{card.subTitle}</mat-card-subtitle>
                                            </mat-card-header>
                                            <mat-card-content>
                                                <p>
                                                    {card.text}
                                                </p>
                                            </mat-card-content>
                                        </Card>
                                    )}
                                </div>

                                <div className="cards-block" ref={this.cards2}>
                                    {this.state.cards2.map(card =>
                                        <Card className="cards" key={card.title}>
                                            <mat-card-header>
                                                <mat-card-title>{card.title}</mat-card-title>
                                                <mat-card-subtitle>{card.subTitle}</mat-card-subtitle>
                                            </mat-card-header>
                                            <mat-card-content>
                                                <p>
                                                    {card.text}
                                                </p>
                                            </mat-card-content>
                                        </Card>
                                    )}
                                </div>
                            </app-tab>
                        </div>
                    </Tabs>
                </div>
            </div>
        );
    }

}

export default App;
